// app/api/gemini-test/route.ts
// Gemini API 테스트용 API 라우트
// 프롬프트 기반 요약 및 태그 생성을 위한 Gemini API 호출 처리
// 관련 파일: lib/actions/ai.ts, app/api-test/page.tsx

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Gemini API 클라이언트 초기화
function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
  }
  return new GoogleGenAI({ apiKey });
}

// 토큰 수 추정 (간단한 추정)
function estimateTokenCount(text: string): number {
  // 한국어와 영어를 고려한 대략적인 토큰 수 계산
  return Math.ceil(text.length * 0.75);
}

// 토큰 제한 검증
function validateTokenLimit(text: string, maxTokens: number = 8192): void {
  const tokenCount = estimateTokenCount(text);
  if (tokenCount > maxTokens) {
    throw new Error(`입력 텍스트가 너무 깁니다. (${tokenCount} 토큰, 최대 ${maxTokens} 토큰)`);
  }
}

// Gemini API 호출 (재시도 로직 포함)
async function callGeminiWithRetry(
  prompt: string,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<string> {
  const client = createGeminiClient();
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      validateTokenLimit(prompt);
      
      const response = await client.models.generateContent({
        model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-001',
        contents: prompt,
      });

      if (response.text) {
        return response.text;
      } else {
        throw new Error('API 응답에서 텍스트를 찾을 수 없습니다.');
      }
    } catch (error: any) {
      console.error(`Gemini API 호출 실패 (시도 ${attempt}/${maxRetries}):`, error);
      
      if (attempt === maxRetries) {
        throw new Error(`API 호출이 ${maxRetries}번 실패했습니다: ${error.message}`);
      }
      
      // 지수 백오프로 재시도 간격 증가
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  throw new Error('예상치 못한 오류가 발생했습니다.');
}

export async function POST(request: NextRequest) {
  try {
    const { type, prompt } = await request.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: '프롬프트를 입력해주세요.' },
        { status: 400 }
      );
    }

    let result: string;
    let systemPrompt: string;

    switch (type) {
      case 'model-test':
        // 모델 성능 테스트용 - 프롬프트를 그대로 사용
        systemPrompt = prompt;
        result = await callGeminiWithRetry(systemPrompt);
        break;
        
      case 'summary':
        systemPrompt = `다음 텍스트를 한국어로 간결하고 명확하게 요약해주세요. 핵심 내용만 포함하여 3-5문장으로 작성해주세요:\n\n${prompt}`;
        result = await callGeminiWithRetry(systemPrompt);
        break;
        
      case 'tags':
        systemPrompt = `다음 텍스트의 주요 키워드나 주제를 파악하여 관련 태그를 생성해주세요. 태그는 쉼표로 구분하여 3-7개 정도 생성해주세요. 각 태그는 2-10자 정도의 간단한 단어나 구문이어야 합니다:\n\n${prompt}`;
        result = await callGeminiWithRetry(systemPrompt);
        break;
        
      default:
        return NextResponse.json(
          { success: false, error: '지원하지 않는 타입입니다. (model-test, summary, tags 중 선택)' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });

  } catch (error: any) {
    console.error('Gemini API 테스트 오류:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || '서버 오류가 발생했습니다.' 
      },
      { status: 500 }
    );
  }
}
