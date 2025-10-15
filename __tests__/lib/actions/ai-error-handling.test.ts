// __tests__/lib/actions/ai-error-handling.test.ts
// AI 에러 처리 서버 액션 테스트
// 강화된 에러 핸들링, 재시도 로직, 데이터 보호 기능 검증

import { 
  generateAIProcessingAction,
  generateSummaryAction,
  generateTagsAction
} from '@/lib/actions/ai';
import { AIErrorType } from '@/lib/types/ai-errors';
import { db } from '@/lib/db';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// Mock 설정
jest.mock('@/lib/actions/ai', () => {
  const actual = jest.requireActual('@/lib/actions/ai');
  return {
    ...actual,
    generateSummaryAction: jest.fn(),
    generateTagsAction: jest.fn()
  };
});

jest.mock('@/lib/db', () => ({
  db: {
    query: {
      notes: {
        findFirst: jest.fn()
      },
      summaries: {
        findFirst: jest.fn()
      },
      noteTags: {
        findMany: jest.fn()
      }
    },
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockResolvedValue(undefined)
    }),
    delete: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined)
    })
  }
}));

jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn()
}));

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn()
    }
  }))
}));

jest.mock('@/lib/utils/error-monitoring', () => ({
  logAIError: jest.fn()
}));

describe('AI Error Handling', () => {
  const mockUser = { id: 'user-123' };
  const mockNote = { id: 'note-123', title: 'Test Note', content: 'Test content' };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 기본 인증 성공 설정
    (createSupabaseServerClient as jest.Mock).mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null
        })
      }
    });

    // 기본 노트 조회 성공 설정
    (db.query.notes.findFirst as jest.Mock).mockResolvedValue(mockNote);
  });

  describe('generateSummaryAction', () => {
    it('should handle authentication error', async () => {
      (createSupabaseServerClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Authentication failed')
          })
        }
      });

      const result = await generateSummaryAction('note-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('로그인이 필요합니다. 다시 로그인해주세요.');
      expect(result.errorType).toBe(AIErrorType.AUTHENTICATION_ERROR);
      expect(result.retryable).toBe(false);
    });

    it('should handle note not found error', async () => {
      (db.query.notes.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await generateSummaryAction('note-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('노트를 찾을 수 없습니다.');
      expect(result.errorType).toBe(AIErrorType.AUTHORIZATION_ERROR);
      expect(result.retryable).toBe(false);
    });

    it('should handle token limit exceeded error', async () => {
      const longContent = 'a'.repeat(50000); // 매우 긴 내용
      (db.query.notes.findFirst as jest.Mock).mockResolvedValue({
        ...mockNote,
        content: longContent
      });

      const result = await generateSummaryAction('note-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('노트가 너무 깁니다');
      expect(result.errorType).toBe(AIErrorType.TOKEN_LIMIT_EXCEEDED);
      expect(result.retryable).toBe(false);
    });

    it('should handle API error with retry information', async () => {
      const { GoogleGenAI } = require('@google/genai');
      const mockClient = new GoogleGenAI();
      mockClient.models.generateContent.mockRejectedValue(new Error('API Error'));

      const result = await generateSummaryAction('note-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Gemini API 호출이');
      expect(result.retryable).toBe(true);
    });
  });

  describe('generateTagsAction', () => {
    it('should handle parsing error when no tags generated', async () => {
      // 파싱 에러를 직접 throw
      (generateTagsAction as jest.Mock).mockRejectedValueOnce(
        new Error('AI가 적절한 태그를 생성하지 못했습니다')
      );

      const result = await generateTagsAction('note-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('AI가 적절한 태그를 생성하지 못했습니다. 다시 시도해주세요.');
      expect(result.errorType).toBe(AIErrorType.PARSING_ERROR);
      expect(result.retryable).toBe(true);
    });

    it('should handle database error during tag save', async () => {
      // 데이터베이스 에러를 직접 throw
      (generateTagsAction as jest.Mock).mockRejectedValueOnce(
        new Error('Database error')
      );

      const result = await generateTagsAction('note-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('데이터 저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      expect(result.errorType).toBe(AIErrorType.DATABASE_ERROR);
      expect(result.retryable).toBe(true);
    });
  });

  describe('generateAIProcessingAction', () => {
    it('should handle partial success scenario', async () => {
      // generateSummaryAction은 성공, generateTagsAction은 실패
      (generateSummaryAction as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: { summary: 'Summary content' }
      });
      
      (generateTagsAction as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'Tag generation failed'
      });

      const result = await generateAIProcessingAction('note-123');

      expect(result.success).toBe(false);
      expect(result.partialSuccess).toBe(true);
      expect(result.partialData?.summary).toBe('Summary content');
      expect(result.partialData?.tags).toBeUndefined();
      expect(result.error).toBe('AI 처리 중 일부 오류가 발생했습니다.');
      expect(result.retryable).toBe(true);
    });

    it('should handle complete failure scenario', async () => {
      // 둘 다 실패
      (generateSummaryAction as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'API Error'
      });
      
      (generateTagsAction as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: 'API Error'
      });

      const result = await generateAIProcessingAction('note-123');

      expect(result.success).toBe(false);
      expect(result.partialSuccess).toBeUndefined();
      expect(result.partialData).toBeUndefined();
      expect(result.error).toContain('API Error');
      expect(result.retryable).toBe(true);
    });
  });

  describe('Error Classification', () => {
    it('should classify network errors correctly', async () => {
      // 네트워크 에러를 직접 throw
      (generateSummaryAction as jest.Mock).mockRejectedValueOnce(
        new Error('Network timeout')
      );

      const result = await generateSummaryAction('note-123');

      expect(result.errorType).toBe(AIErrorType.NETWORK_ERROR);
      expect(result.error).toBe('네트워크 연결에 문제가 있습니다. 잠시 후 다시 시도해주세요.');
      expect(result.retryable).toBe(true);
    });

    it('should classify validation errors correctly', async () => {
      const result = await generateSummaryAction('');

      expect(result.success).toBe(false);
      expect(result.errorType).toBe(AIErrorType.VALIDATION_ERROR);
      expect(result.retryable).toBe(false);
    });
  });

  describe('Retry Logic', () => {
    it('should respect retryable flag for non-retryable errors', async () => {
      (createSupabaseServerClient as jest.Mock).mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Authentication failed')
          })
        }
      });

      const result = await generateSummaryAction('note-123');

      expect(result.retryable).toBe(false);
      expect(result.errorType).toBe(AIErrorType.AUTHENTICATION_ERROR);
    });

    it('should mark retryable errors correctly', async () => {
      // 네트워크 에러를 직접 throw
      (generateSummaryAction as jest.Mock).mockRejectedValueOnce(
        new Error('Network timeout')
      );

      const result = await generateSummaryAction('note-123');

      expect(result.retryable).toBe(true);
      expect(result.errorType).toBe(AIErrorType.NETWORK_ERROR);
    });
  });
});
