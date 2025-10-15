// __tests__/lib/actions/ai.test.ts
// AI 서버 액션에 대한 단위 테스트
// 토큰 계산, 에러 핸들링, API 호출 로직 등을 검증

import { 
  generateSummaryAction, 
  generateTagsAction, 
  generateAIProcessingAction,
  testGeminiConnectionAction 
} from '@/lib/actions/ai';

// Mock dependencies
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    models: {
      generateContent: jest.fn(),
    },
  })),
}));

jest.mock('@/lib/db', () => ({
  db: {
    query: {
      notes: {
        findFirst: jest.fn(),
      },
    },
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockResolvedValue({}),
    }),
    delete: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue({}),
    }),
  },
}));

jest.mock('@/lib/supabase', () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

const mockDb = {
  query: {
    notes: {
      findFirst: jest.fn(),
    },
  },
  insert: jest.fn().mockReturnValue({
    values: jest.fn().mockResolvedValue({}),
  }),
  delete: jest.fn().mockReturnValue({
    where: jest.fn().mockResolvedValue({}),
  }),
};

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
};

const mockCreateServerClient = jest.fn(() => mockSupabaseClient);

describe('AI Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    require('@/lib/supabase').createSupabaseServerClient = mockCreateServerClient;
    require('@/lib/db').db = mockDb;
    
    // 환경 변수 설정
    process.env.GEMINI_API_KEY = 'test-api-key';
    process.env.GEMINI_MODEL = 'gemini-2.0-flash-001';
  });

  describe('testGeminiConnectionAction', () => {
    it('successfully tests API connection', async () => {
      // Mock Gemini API response
      const { GoogleGenAI } = require('@google/genai');
      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: '연결 테스트 성공',
      });
      
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      const result = await testGeminiConnectionAction();

      expect(result.success).toBe(true);
      expect(result.data?.message).toContain('API 연결 성공');
    });

    it('handles connection test failure', async () => {
      // Mock Gemini API error
      const { GoogleGenAI } = require('@google/genai');
      const mockGenerateContent = jest.fn().mockRejectedValue(new Error('Connection failed'));
      
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      const result = await testGeminiConnectionAction();

      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection failed');
    });
  });

  describe('generateSummaryAction', () => {
    const mockUser = { id: 'user-123' };
    const mockNote = {
      id: 'note-123',
      title: '테스트 노트',
      content: '이것은 테스트 노트 내용입니다.',
    };

    it('returns error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      });

      const result = await generateSummaryAction('note-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('로그인이 필요합니다.');
    });

    it('returns error when note is not found', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      });
      
      mockDb.query.notes.findFirst.mockResolvedValue(null);

      const result = await generateSummaryAction('note-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('노트를 찾을 수 없습니다.');
    });
  });

  describe('generateTagsAction', () => {
    const mockUser = { id: 'user-123' };
    const mockNote = {
      id: 'note-123',
      title: '테스트 노트',
      content: '이것은 테스트 노트 내용입니다.',
    };

    it('returns error when user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      });

      const result = await generateTagsAction('note-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('로그인이 필요합니다.');
    });

    it('returns error when note is not found', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      });
      
      mockDb.query.notes.findFirst.mockResolvedValue(null);

      const result = await generateTagsAction('note-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('노트를 찾을 수 없습니다.');
    });

    it('successfully generates tags', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      });
      
      mockDb.query.notes.findFirst.mockResolvedValue(mockNote);

      // Mock Gemini API response
      const { GoogleGenAI } = require('@google/genai');
      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: 'AI, 자동화, 태그, 테스트, 개발',
      });
      
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      const result = await generateTagsAction('note-123');

      expect(result.success).toBe(true);
      expect(result.data?.tags).toEqual(['AI', '자동화', '태그', '테스트', '개발']);
    });

    it('limits tags to maximum 6', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      });
      
      mockDb.query.notes.findFirst.mockResolvedValue(mockNote);

      // Mock Gemini API response with more than 6 tags
      const { GoogleGenAI } = require('@google/genai');
      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: 'AI, 자동화, 태그, 테스트, 개발, 프로그래밍, 코딩, 소프트웨어',
      });
      
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      const result = await generateTagsAction('note-123');

      expect(result.success).toBe(true);
      expect(result.data?.tags).toHaveLength(6);
    });

    it('handles empty tag response', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      });
      
      mockDb.query.notes.findFirst.mockResolvedValue(mockNote);

      // Mock Gemini API response with empty tags
      const { GoogleGenAI } = require('@google/genai');
      const mockGenerateContent = jest.fn().mockResolvedValue({
        text: '',
      });
      
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      const result = await generateTagsAction('note-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('생성된 태그가 없습니다.');
    });

    it('handles API call failure', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ 
        data: { user: mockUser }, 
        error: null 
      });
      
      mockDb.query.notes.findFirst.mockResolvedValue(mockNote);

      // Mock Gemini API error
      const { GoogleGenAI } = require('@google/genai');
      const mockGenerateContent = jest.fn().mockRejectedValue(new Error('API Error'));
      
      GoogleGenAI.mockImplementation(() => ({
        models: {
          generateContent: mockGenerateContent,
        },
      }));

      const result = await generateTagsAction('note-123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('API Error');
    });
  });
});
