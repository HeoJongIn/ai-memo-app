// __tests__/lib/actions/ai-edit.test.ts
// AI 편집 관련 서버 액션 테스트
// 요약/태그 수동 편집 기능 테스트
// 권한 검증과 데이터 검증 포함

import { updateSummaryAction, updateTagsAction } from '@/lib/actions/ai';
import { db } from '@/lib/db';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { summaries, noteTags, notes } from '@/drizzle/schema';

// Mock 설정
jest.mock('@/lib/db', () => ({
  db: {
    query: {
      notes: {
        findFirst: jest.fn(),
      },
      summaries: {
        findFirst: jest.fn(),
      },
    },
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockResolvedValue(undefined),
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue(undefined),
      }),
    }),
    delete: jest.fn().mockReturnValue({
      where: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

jest.mock('@/lib/supabase-server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock('@/drizzle/schema', () => ({
  summaries: {
    noteId: 'noteId',
  },
  noteTags: {
    noteId: 'noteId',
  },
  notes: {
    userId: 'userId',
    id: 'id',
  },
}));

const mockDb = db as jest.Mocked<typeof db>;
const mockSupabase = createSupabaseServerClient as jest.MockedFunction<typeof createSupabaseServerClient>;

describe('AI Edit Actions', () => {
  const mockNoteId = 'test-note-id';
  const mockUserId = 'test-user-id';
  const mockUser = { id: mockUserId };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // 기본 인증 mock 설정
    mockSupabase.mockResolvedValue({
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
        }),
      },
    } as any);
  });

  describe('updateSummaryAction', () => {
    it('요약을 성공적으로 업데이트한다', async () => {
      // Mock 설정
      mockDb.query.notes.findFirst.mockResolvedValue({ id: mockNoteId });
      mockDb.query.summaries.findFirst.mockResolvedValue({ id: 'summary-id' });
      mockDb.update.mockResolvedValue(undefined);

      const result = await updateSummaryAction(mockNoteId, '새로운 요약 내용');

      expect(result.success).toBe(true);
      expect(result.data?.summary).toBe('새로운 요약 내용');
      expect(mockDb.update).toHaveBeenCalled();
    });

    it('기존 요약이 없으면 새로 생성한다', async () => {
      // Mock 설정
      mockDb.query.notes.findFirst.mockResolvedValue({ id: mockNoteId });
      mockDb.query.summaries.findFirst.mockResolvedValue(null);
      mockDb.insert.mockResolvedValue(undefined);

      const result = await updateSummaryAction(mockNoteId, '새로운 요약 내용');

      expect(result.success).toBe(true);
      expect(result.data?.summary).toBe('새로운 요약 내용');
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('인증되지 않은 사용자는 요약을 수정할 수 없다', async () => {
      mockSupabase.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Unauthorized'),
          }),
        },
      } as any);

      const result = await updateSummaryAction(mockNoteId, '새로운 요약 내용');

      expect(result.success).toBe(false);
      expect(result.error).toBe('로그인이 필요합니다.');
    });

    it('노트 소유자가 아니면 요약을 수정할 수 없다', async () => {
      mockDb.query.notes.findFirst.mockResolvedValue(null);

      const result = await updateSummaryAction(mockNoteId, '새로운 요약 내용');

      expect(result.success).toBe(false);
      expect(result.error).toBe('노트를 찾을 수 없거나 권한이 없습니다.');
    });

    it('빈 요약 내용은 거부한다', async () => {
      mockDb.query.notes.findFirst.mockResolvedValue({ id: mockNoteId });

      const result = await updateSummaryAction(mockNoteId, '');

      expect(result.success).toBe(false);
      expect(result.error).toBe('요약 내용을 입력해주세요.');
    });

    it('너무 긴 요약은 거부한다', async () => {
      mockDb.query.notes.findFirst.mockResolvedValue({ id: mockNoteId });
      const longContent = 'a'.repeat(2001);

      const result = await updateSummaryAction(mockNoteId, longContent);

      expect(result.success).toBe(false);
      expect(result.error).toBe('요약이 너무 깁니다. (최대 2000자)');
    });
  });

  describe('updateTagsAction', () => {
    it('태그를 성공적으로 업데이트한다', async () => {
      // Mock 설정
      mockDb.query.notes.findFirst.mockResolvedValue({ id: mockNoteId });
      mockDb.delete.mockResolvedValue(undefined);
      mockDb.insert.mockResolvedValue(undefined);

      const result = await updateTagsAction(mockNoteId, ['태그1', '태그2', '태그3']);

      expect(result.success).toBe(true);
      expect(result.data?.tags).toEqual(['태그1', '태그2', '태그3']);
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('태그를 정리하고 검증한다', async () => {
      mockDb.query.notes.findFirst.mockResolvedValue({ id: mockNoteId });
      mockDb.delete.mockResolvedValue(undefined);
      mockDb.insert.mockResolvedValue(undefined);

      const result = await updateTagsAction(mockNoteId, ['  태그1  ', '', '태그2', '   ']);

      expect(result.success).toBe(true);
      expect(result.data?.tags).toEqual(['태그1', '태그2']);
    });

    it('최대 태그 개수를 제한한다', async () => {
      mockDb.query.notes.findFirst.mockResolvedValue({ id: mockNoteId });
      mockDb.delete.mockResolvedValue(undefined);
      mockDb.insert.mockResolvedValue(undefined);

      const manyTags = Array.from({ length: 15 }, (_, i) => `태그${i + 1}`);
      const result = await updateTagsAction(mockNoteId, manyTags);

      expect(result.success).toBe(true);
      expect(result.data?.tags).toHaveLength(10);
    });

    it('태그 길이를 제한한다', async () => {
      mockDb.query.notes.findFirst.mockResolvedValue({ id: mockNoteId });
      mockDb.delete.mockResolvedValue(undefined);
      mockDb.insert.mockResolvedValue(undefined);

      const longTag = 'a'.repeat(51);
      const result = await updateTagsAction(mockNoteId, ['태그1', longTag, '태그2']);

      expect(result.success).toBe(true);
      expect(result.data?.tags).toEqual(['태그1', '태그2']);
    });

    it('빈 태그 배열은 거부한다', async () => {
      mockDb.query.notes.findFirst.mockResolvedValue({ id: mockNoteId });

      const result = await updateTagsAction(mockNoteId, []);

      expect(result.success).toBe(false);
      expect(result.error).toBe('최소 1개의 태그를 입력해주세요.');
    });

    it('인증되지 않은 사용자는 태그를 수정할 수 없다', async () => {
      mockSupabase.mockResolvedValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Unauthorized'),
          }),
        },
      } as any);

      const result = await updateTagsAction(mockNoteId, ['태그1']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('로그인이 필요합니다.');
    });

    it('노트 소유자가 아니면 태그를 수정할 수 없다', async () => {
      mockDb.query.notes.findFirst.mockResolvedValue(null);

      const result = await updateTagsAction(mockNoteId, ['태그1']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('노트를 찾을 수 없거나 권한이 없습니다.');
    });
  });
});
