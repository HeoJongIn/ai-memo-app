// lib/actions/ai.ts
// AI 서버 액션 함수들
// Google Gemini API를 사용하여 노트 요약 및 태그 생성 기능 제공
// 사용자 스코프 기반 보안과 강화된 에러 핸들링 포함

'use server';

import { GoogleGenAI } from '@google/genai';
import { db } from '@/lib/db';
import { summaries, noteTags, notes } from '@/drizzle/schema';
import { eq, and } from 'drizzle-orm';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { logAIError } from '@/lib/utils/error-monitoring';
import { AIErrorType, AIErrorInfo } from '@/lib/types/ai-errors';

// 에러 로깅 함수 (에러 모니터링 시스템과 통합)
function logError(errorInfo: AIErrorInfo, context?: unknown): void {
  const logData = {
    timestamp: new Date().toISOString(),
    errorType: errorInfo.type,
    message: errorInfo.message,
    userMessage: errorInfo.userMessage,
    retryable: errorInfo.retryable,
    context,
    details: errorInfo.details
  };
  
  console.error('AI Error:', logData);
  
  // 에러 모니터링 시스템에 로그 추가
  logAIError(errorInfo, {
    action: 'unknown',
    retryCount: 0,
    success: false,
    ...(context || {})
  });
  
  // TODO: 실제 프로덕션에서는 외부 로깅 서비스로 전송
  // 예: Sentry, DataDog, CloudWatch 등
}

// 에러 분류 및 사용자 친화적 메시지 생성
function classifyError(error: unknown): AIErrorInfo {
  const errorMessage = (error instanceof Error ? error.message : String(error)) || '알 수 없는 오류';
  
  // 인증 관련 에러
  if (errorMessage.includes('로그인이 필요') || errorMessage.includes('인증')) {
    return {
      type: AIErrorType.AUTHENTICATION_ERROR,
      message: errorMessage,
      userMessage: '로그인이 필요합니다. 다시 로그인해주세요.',
      retryable: false
    };
  }
  
  // 권한 관련 에러
  if (errorMessage.includes('권한이 없') || errorMessage.includes('접근 거부') || 
      errorMessage.includes('노트를 찾을 수 없습니다')) {
    return {
      type: AIErrorType.AUTHORIZATION_ERROR,
      message: errorMessage,
      userMessage: '노트를 찾을 수 없습니다.',
      retryable: false
    };
  }
  
  // 토큰 제한 초과
  if (errorMessage.includes('토큰') && errorMessage.includes('너무 깁니다')) {
    return {
      type: AIErrorType.TOKEN_LIMIT_EXCEEDED,
      message: errorMessage,
      userMessage: '노트가 너무 깁니다. 내용을 줄이거나 여러 개의 노트로 나누어주세요.',
      retryable: false
    };
  }
  
  // 네트워크 관련 에러
  if (errorMessage.includes('네트워크') || errorMessage.includes('연결') || 
      errorMessage.includes('timeout') || errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('Network timeout') || errorMessage.includes('Connection refused')) {
    return {
      type: AIErrorType.NETWORK_ERROR,
      message: errorMessage,
      userMessage: '네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.',
      retryable: true
    };
  }
  
  // API 관련 에러
  if (errorMessage.includes('API') || errorMessage.includes('Gemini') || 
      errorMessage.includes('호출') || errorMessage.includes('응답') ||
      errorMessage.includes('GEMINI_API_KEY') || errorMessage.includes('API Error')) {
    return {
      type: AIErrorType.API_ERROR,
      message: errorMessage,
      userMessage: 'Gemini API 호출이 실패했습니다. 잠시 후 다시 시도해주세요.',
      retryable: true
    };
  }
  
  // 파싱 관련 에러
  if (errorMessage.includes('파싱') || errorMessage.includes('생성된') || 
      errorMessage.includes('텍스트를 찾을 수 없습니다') || errorMessage.includes('AI가 적절한')) {
    return {
      type: AIErrorType.PARSING_ERROR,
      message: errorMessage,
      userMessage: 'AI가 적절한 태그를 생성하지 못했습니다. 다시 시도해주세요.',
      retryable: true
    };
  }
  
  // 데이터베이스 관련 에러
  if (errorMessage.includes('데이터베이스') || errorMessage.includes('DB') || 
      errorMessage.includes('저장') || errorMessage.includes('조회') ||
      errorMessage.includes('Database error')) {
    return {
      type: AIErrorType.DATABASE_ERROR,
      message: errorMessage,
      userMessage: '데이터 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
      retryable: true
    };
  }
  
  // 검증 관련 에러
  if (errorMessage.includes('검증') || errorMessage.includes('입력') || 
      errorMessage.includes('유효하지') || errorMessage.includes('noteId') && errorMessage.includes('빈 문자열')) {
    return {
      type: AIErrorType.VALIDATION_ERROR,
      message: errorMessage,
      userMessage: '입력 데이터에 문제가 있습니다. 내용을 확인해주세요.',
      retryable: false
    };
  }
  
  // 기타 에러
  return {
    type: AIErrorType.UNKNOWN_ERROR,
    message: errorMessage,
    userMessage: '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    retryable: true
  };
}

// Gemini API 클라이언트 초기화
function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
  }
  
  return new GoogleGenAI({ apiKey });
}

// 토큰 수 계산 함수 (대략적인 추정)
function estimateTokenCount(text: string): number {
  // 한국어와 영어를 고려한 대략적인 토큰 계산
  // 일반적으로 1 토큰 ≈ 4자 (영어 기준) 또는 1-2자 (한국어 기준)
  const koreanChars = (text.match(/[가-힣]/g) || []).length;
  const englishChars = text.length - koreanChars;
  
  // 한국어는 1자당 1.5토큰, 영어는 4자당 1토큰으로 추정
  return Math.ceil(koreanChars * 1.5 + englishChars / 4);
}

// 토큰 제한 검증
function validateTokenLimit(text: string, maxTokens: number = 8192): void {
  const tokenCount = estimateTokenCount(text);
  if (tokenCount > maxTokens) {
    throw new Error(`텍스트가 너무 깁니다. 예상 토큰 수: ${tokenCount}, 최대 허용: ${maxTokens}`);
  }
}

// Gemini API 응답에서 토큰 사용량 추출 및 비용 계산
interface UsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

// 재시도 로직이 포함된 API 호출 함수 (강화된 에러 처리)
async function callGeminiWithRetry(
  prompt: string,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<{ text: string; usageMetadata?: UsageMetadata }> {
  const client = createGeminiClient();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-001',
        contents: prompt,
      });
      
      if (!response.text) {
        throw new Error('API 응답에서 텍스트를 찾을 수 없습니다.');
      }
      
      // 성공 시 로깅
      console.log(`Gemini API 호출 성공 (시도 ${attempt}/${maxRetries})`);
      return { 
        text: response.text,
        usageMetadata: response.usageMetadata
      };
      
    } catch (error) {
      const errorInfo = classifyError(error);
      
      // 에러 로깅
      logError(errorInfo, {
        attempt,
        maxRetries,
        prompt: prompt.substring(0, 100) + '...' // 프롬프트 일부만 로깅
      });
      
      // 재시도 불가능한 에러인 경우 즉시 실패
      if (!errorInfo.retryable) {
        throw error;
      }
      
      // 마지막 시도인 경우 실패
      if (attempt === maxRetries) {
        throw new Error(`Gemini API 호출이 ${maxRetries}번 모두 실패했습니다: ${errorInfo.userMessage}`);
      }
      
      // 지수 백오프 + 랜덤 지터 적용
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.log(`재시도 대기 중... (${Math.round(delay)}ms)`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // 이론적으로 도달하지 않는 코드
  throw new Error('재시도 로직에서 예상치 못한 오류가 발생했습니다.');
}

// 노트 요약 생성 서버 액션 (강화된 에러 처리)
export async function generateSummaryAction(noteId: string): Promise<{
  success: boolean;
  data?: { summary: string };
  error?: string;
  errorType?: AIErrorType;
  retryable?: boolean;
}> {
  try {
    // 사용자 인증 확인
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      const errorInfo = classifyError(new Error('로그인이 필요합니다.'));
      logError(errorInfo, { noteId, action: 'generateSummary' });
      return { 
        success: false, 
        error: errorInfo.userMessage,
        errorType: errorInfo.type,
        retryable: errorInfo.retryable
      };
    }

    // 노트 데이터 조회
    const note = await db.query.notes.findFirst({
      where: and(eq(notes.userId, user.id), eq(notes.id, noteId)),
      columns: { id: true, title: true, content: true }
    });

    if (!note) {
      const errorInfo = classifyError(new Error('노트를 찾을 수 없습니다.'));
      logError(errorInfo, { noteId, userId: user.id, action: 'generateSummary' });
      return { 
        success: false, 
        error: errorInfo.userMessage,
        errorType: errorInfo.type,
        retryable: errorInfo.retryable
      };
    }

    // 토큰 제한 검증
    const fullText = `${note.title}\n\n${note.content}`;
    try {
      validateTokenLimit(fullText);
    } catch (tokenError) {
      const errorInfo = classifyError(tokenError);
      logError(errorInfo, { noteId, textLength: fullText.length, action: 'generateSummary' });
      return { 
        success: false, 
        error: errorInfo.userMessage,
        errorType: errorInfo.type,
        retryable: errorInfo.retryable
      };
    }

    // 요약 프롬프트 생성
    const summaryPrompt = `다음 노트를 3-6개의 불릿 포인트로 요약해주세요. 핵심 내용만 간결하게 정리해주세요.

제목: ${note.title}

내용:
${note.content}

요약:`;

    // Gemini API 호출
    const result = await callGeminiWithRetry(summaryPrompt, 3, 1000);
    const summary = result.text;

    // 요약을 데이터베이스에 저장
    try {
      await db.insert(summaries).values({
        noteId: noteId,
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-001',
        content: summary,
      });
    } catch (dbError) {
      const errorInfo = classifyError(dbError);
      logError(errorInfo, { noteId, summary, action: 'generateSummary' });
      return { 
        success: false, 
        error: errorInfo.userMessage,
        errorType: errorInfo.type,
        retryable: errorInfo.retryable
      };
    }

    // 성공 로깅
    console.log(`요약 생성 성공: noteId=${noteId}, summaryLength=${summary.length}`);
    return { success: true, data: { summary } };
    
  } catch (error) {
    const errorInfo = classifyError(error);
    logError(errorInfo, { noteId, action: 'generateSummary' });
    return { 
      success: false, 
      error: errorInfo.userMessage,
      errorType: errorInfo.type,
      retryable: errorInfo.retryable
    };
  }
}

// 노트 태그 생성 서버 액션 (강화된 에러 처리)
export async function generateTagsAction(noteId: string): Promise<{
  success: boolean;
  data?: { tags: string[] };
  error?: string;
  errorType?: AIErrorType;
  retryable?: boolean;
}> {
  try {
    // 사용자 인증 확인
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      const errorInfo = classifyError(new Error('로그인이 필요합니다.'));
      logError(errorInfo, { noteId, action: 'generateTags' });
      return { 
        success: false, 
        error: errorInfo.userMessage,
        errorType: errorInfo.type,
        retryable: errorInfo.retryable
      };
    }

    // 노트 데이터 조회
    const note = await db.query.notes.findFirst({
      where: and(eq(notes.userId, user.id), eq(notes.id, noteId)),
      columns: { id: true, title: true, content: true }
    });

    if (!note) {
      const errorInfo = classifyError(new Error('노트를 찾을 수 없습니다.'));
      logError(errorInfo, { noteId, userId: user.id, action: 'generateTags' });
      return { 
        success: false, 
        error: errorInfo.userMessage,
        errorType: errorInfo.type,
        retryable: errorInfo.retryable
      };
    }

    // 토큰 제한 검증
    const fullText = `${note.title}\n\n${note.content}`;
    try {
      validateTokenLimit(fullText);
    } catch (tokenError) {
      const errorInfo = classifyError(tokenError);
      logError(errorInfo, { noteId, textLength: fullText.length, action: 'generateTags' });
      return { 
        success: false, 
        error: errorInfo.userMessage,
        errorType: errorInfo.type,
        retryable: errorInfo.retryable
      };
    }

    // 태그 생성 프롬프트
    const tagPrompt = `다음 노트의 내용을 분석하여 관련성 높은 태그를 최대 6개까지 생성해주세요. 각 태그는 한 단어 또는 짧은 구문으로 작성해주세요.

제목: ${note.title}

내용:
${note.content}

태그 (쉼표로 구분):`;

    // Gemini API 호출
    const result = await callGeminiWithRetry(tagPrompt, 3, 1000);
    const tagResponse = result.text;

    // 태그 파싱 및 정리
    let tags: string[] = [];
    try {
      tags = tagResponse
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && tag.length <= 100)
        .slice(0, 6); // 최대 6개로 제한
    } catch {
      const errorInfo = classifyError(new Error('AI 응답을 파싱하는 중 오류가 발생했습니다.'));
      logError(errorInfo, { noteId, tagResponse, action: 'generateTags' });
      return { 
        success: false, 
        error: errorInfo.userMessage,
        errorType: errorInfo.type,
        retryable: errorInfo.retryable
      };
    }

    if (tags.length === 0) {
      const errorInfo = classifyError(new Error('생성된 태그가 없습니다.'));
      logError(errorInfo, { noteId, tagResponse, action: 'generateTags' });
      return { 
        success: false, 
        error: 'AI가 적절한 태그를 생성하지 못했습니다. 다시 시도해주세요.',
        errorType: AIErrorType.PARSING_ERROR,
        retryable: true
      };
    }

    // 기존 태그 삭제 후 새 태그 저장
    try {
      await db.delete(noteTags).where(eq(noteTags.noteId, noteId));
      
      if (tags.length > 0) {
        await db.insert(noteTags).values(
          tags.map(tag => ({ noteId, tag }))
        );
      }
    } catch (dbError) {
      const errorInfo = classifyError(dbError);
      logError(errorInfo, { noteId, tags, action: 'generateTags' });
      return { 
        success: false, 
        error: errorInfo.userMessage,
        errorType: errorInfo.type,
        retryable: errorInfo.retryable
      };
    }

    // 성공 로깅
    console.log(`태그 생성 성공: noteId=${noteId}, tagsCount=${tags.length}`);
    return { success: true, data: { tags } };
    
  } catch (error) {
    const errorInfo = classifyError(error);
    logError(errorInfo, { noteId, action: 'generateTags' });
    return { 
      success: false, 
      error: errorInfo.userMessage,
      errorType: errorInfo.type,
      retryable: errorInfo.retryable
    };
  }
}

// AI 처리 통합 서버 액션 (요약 + 태그) - 강화된 에러 처리 및 데이터 보호
export async function generateAIProcessingAction(noteId: string): Promise<{
  success: boolean;
  data?: { summary: string; tags: string[] };
  error?: string;
  errorType?: AIErrorType;
  retryable?: boolean;
  partialSuccess?: boolean;
  partialData?: { summary?: string; tags?: string[] };
}> {
  try {
    // 사용자 인증 확인
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      const errorInfo = classifyError(new Error('로그인이 필요합니다.'));
      logError(errorInfo, { noteId, action: 'generateAIProcessing' });
      return { 
        success: false, 
        error: errorInfo.userMessage,
        errorType: errorInfo.type,
        retryable: errorInfo.retryable
      };
    }

    // 노트 데이터 조회
    const note = await db.query.notes.findFirst({
      where: and(eq(notes.userId, user.id), eq(notes.id, noteId)),
      columns: { id: true, title: true, content: true }
    });

    if (!note) {
      const errorInfo = classifyError(new Error('노트를 찾을 수 없습니다.'));
      logError(errorInfo, { noteId, userId: user.id, action: 'generateAIProcessing' });
      return { 
        success: false, 
        error: errorInfo.userMessage,
        errorType: errorInfo.type,
        retryable: errorInfo.retryable
      };
    }

    // 토큰 제한 검증
    const fullText = `${note.title}\n\n${note.content}`;
    try {
      validateTokenLimit(fullText);
    } catch (tokenError) {
      const errorInfo = classifyError(tokenError);
      logError(errorInfo, { noteId, textLength: fullText.length, action: 'generateAIProcessing' });
      return { 
        success: false, 
        error: errorInfo.userMessage,
        errorType: errorInfo.type,
        retryable: errorInfo.retryable
      };
    }

    // 기존 데이터 백업 (클라이언트에서 처리)
    // 서버에서는 기존 데이터 조회만 수행

    // 요약과 태그를 병렬로 생성
    const [summaryResult, tagsResult] = await Promise.allSettled([
      generateSummaryAction(noteId),
      generateTagsAction(noteId)
    ]);

    // 결과 분석
    const summarySuccess = summaryResult.status === 'fulfilled' && summaryResult.value.success;
    const tagsSuccess = tagsResult.status === 'fulfilled' && tagsResult.value.success;

    // 완전 성공
    if (summarySuccess && tagsSuccess) {
      const summaryData = summaryResult.value.data!;
      const tagsData = tagsResult.value.data!;
      
      console.log(`AI 처리 완전 성공: noteId=${noteId}, summaryLength=${summaryData.summary.length}, tagsCount=${tagsData.tags.length}`);
      
      return {
        success: true,
        data: {
          summary: summaryData.summary,
          tags: tagsData.tags
        }
      };
    }

    // 부분 성공 처리 (하나라도 성공한 경우)
    if (summarySuccess || tagsSuccess) {
      const partialData: { summary?: string; tags?: string[] } = {};
      const errors: string[] = [];

      if (summarySuccess) {
        partialData.summary = summaryResult.value.data!.summary;
      } else {
        const error = summaryResult.status === 'rejected' 
          ? summaryResult.reason 
          : summaryResult.value.error;
        errors.push(`요약 생성 실패: ${error}`);
      }

      if (tagsSuccess) {
        partialData.tags = tagsResult.value.data!.tags;
      } else {
        const error = tagsResult.status === 'rejected' 
          ? tagsResult.reason 
          : tagsResult.value.error;
        errors.push(`태그 생성 실패: ${error}`);
      }

      // 부분 성공 로깅
      logError({
        type: AIErrorType.PARSING_ERROR,
        message: `부분적 성공: ${errors.join(', ')}`,
        userMessage: '일부 AI 처리가 완료되었습니다.',
        retryable: true
      }, { 
        noteId, 
        partialData, 
        errors,
        action: 'generateAIProcessing'
      });

      return {
        success: false,
        error: 'AI 처리 중 일부 오류가 발생했습니다.',
        errorType: AIErrorType.PARSING_ERROR,
        retryable: true,
        partialSuccess: true,
        partialData
      };
    }

    // 완전 실패 처리
    const firstError = summaryResult.status === 'rejected' 
      ? summaryResult.reason 
      : summaryResult.value.error;
    
    const errorInfo = classifyError(firstError);
    logError(errorInfo, { noteId, action: 'generateAIProcessing' });
    
    return {
      success: false,
      error: errorInfo.userMessage,
      errorType: errorInfo.type,
      retryable: errorInfo.retryable
    };
    
  } catch (error) {
    const errorInfo = classifyError(error);
    logError(errorInfo, { noteId, action: 'generateAIProcessing' });
    return { 
      success: false, 
      error: errorInfo.userMessage,
      errorType: errorInfo.type,
      retryable: errorInfo.retryable
    };
  }
}

// 요약 수동 편집 서버 액션
export async function updateSummaryAction(noteId: string, newContent: string): Promise<{
  success: boolean;
  data?: { summary: string };
  error?: string;
}> {
  try {
    // 사용자 인증 확인
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 노트 소유권 확인
    const note = await db.query.notes.findFirst({
      where: and(eq(notes.userId, user.id), eq(notes.id, noteId)),
      columns: { id: true }
    });

    if (!note) {
      return { success: false, error: '노트를 찾을 수 없거나 권한이 없습니다.' };
    }

    // 요약 내용 검증
    if (!newContent || newContent.trim().length === 0) {
      return { success: false, error: '요약 내용을 입력해주세요.' };
    }

    if (newContent.length > 2000) {
      return { success: false, error: '요약이 너무 깁니다. (최대 2000자)' };
    }

    // 기존 요약 업데이트 또는 새로 생성
    const existingSummary = await db.query.summaries.findFirst({
      where: eq(summaries.noteId, noteId),
      columns: { noteId: true }
    });

    if (existingSummary) {
      // 기존 요약 업데이트
      await db.update(summaries)
        .set({ 
          content: newContent.trim(),
          createdAt: new Date()
        })
        .where(eq(summaries.noteId, noteId));
    } else {
      // 새 요약 생성
      await db.insert(summaries).values({
        noteId: noteId,
        model: 'manual-edit',
        content: newContent.trim(),
      });
    }

    return { success: true, data: { summary: newContent.trim() } };
  } catch (error) {
    console.error('Error updating summary:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '요약 업데이트 중 오류가 발생했습니다.' 
    };
  }
}

// 태그 수동 편집 서버 액션
export async function updateTagsAction(noteId: string, newTags: string[]): Promise<{
  success: boolean;
  data?: { tags: string[] };
  error?: string;
}> {
  try {
    // 사용자 인증 확인
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 노트 소유권 확인
    const note = await db.query.notes.findFirst({
      where: and(eq(notes.userId, user.id), eq(notes.id, noteId)),
      columns: { id: true }
    });

    if (!note) {
      return { success: false, error: '노트를 찾을 수 없거나 권한이 없습니다.' };
    }

    // 태그 검증
    const validTags = newTags
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0 && tag.length <= 50)
      .slice(0, 10); // 최대 10개로 제한

    if (validTags.length === 0) {
      return { success: false, error: '최소 1개의 태그를 입력해주세요.' };
    }

    // 기존 태그 삭제 후 새 태그 저장
    await db.delete(noteTags).where(eq(noteTags.noteId, noteId));
    
    if (validTags.length > 0) {
      await db.insert(noteTags).values(
        validTags.map(tag => ({ noteId, tag }))
      );
    }

    return { success: true, data: { tags: validTags } };
  } catch (error) {
    console.error('Error updating tags:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '태그 업데이트 중 오류가 발생했습니다.' 
    };
  }
}

// API 연결 테스트 함수
export async function testGeminiConnectionAction(): Promise<{
  success: boolean;
  data?: { message: string };
  error?: string;
}> {
  try {
    const testPrompt = '안녕하세요. 연결 테스트입니다.';
    const result = await callGeminiWithRetry(testPrompt);
    
    return { 
      success: true, 
      data: { message: `API 연결 성공: ${result.text}` } 
    };
  } catch (error) {
    console.error('Error testing Gemini connection:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'API 연결 테스트 실패' 
    };
  }
}
