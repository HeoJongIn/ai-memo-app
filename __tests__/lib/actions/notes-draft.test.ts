// __tests__/lib/actions/notes-draft.test.ts
// 임시 저장 서버 액션 테스트
// 임시 저장 관련 서버 액션들의 기능을 테스트
// Jest를 사용한 단위 테스트

import { 
  saveDraftAction, 
  getDraftsAction, 
  convertDraftToNoteAction, 
  deleteDraftAction,
  cleanupExpiredDrafts 
} from '@/lib/actions/notes';

// Mock 설정
jest.mock('@/lib/db', () => ({
  db: {
    insert: jest.fn(),
    select: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn((field, value) => ({ field, value })),
  and: jest.fn((...conditions) => conditions),
  desc: jest.fn((field) => ({ field, direction: 'desc' })),
  sql: jest.fn((template) => ({ template })),
}));

const mockDb = {
  insert: jest.fn(),
  select: jest.fn(),
  delete: jest.fn(),
};

const mockDraftNotes = {
  id: 'draft-1',
  userId: 'user-1',
  title: 'Test Draft',
  content: 'Test content',
  createdAt: new Date(),
  updatedAt: new Date(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7일 후
};

const mockNotes = {
  id: 'note-1',
  userId: 'user-1',
  title: 'Test Note',
  content: 'Test content',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Draft Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveDraftAction', () => {
    it('saves draft successfully', async () => {
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([mockDraftNotes])
        })
      });

      const result = await saveDraftAction('Test Title', 'Test Content');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDraftNotes);
    });

    it('handles empty title and content', async () => {
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([{
            ...mockDraftNotes,
            title: '제목 없음',
            content: ''
          }])
        })
      });

      const result = await saveDraftAction('', '');

      expect(result.success).toBe(true);
    });

    it('handles database error', async () => {
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockRejectedValueOnce(new Error('Database error'))
        })
      });

      const result = await saveDraftAction('Test Title', 'Test Content');

      expect(result.success).toBe(false);
      expect(result.error).toBe('임시 저장 중 오류가 발생했습니다.');
    });
  });

  describe('getDraftsAction', () => {
    it('fetches drafts successfully', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            orderBy: jest.fn().mockResolvedValueOnce([mockDraftNotes])
          })
        })
      });

      const result = await getDraftsAction();

      expect(result.success).toBe(true);
      expect(result.data).toEqual([mockDraftNotes]);
    });

    it('handles database error', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockReturnValueOnce({
            orderBy: jest.fn().mockRejectedValueOnce(new Error('Database error'))
          })
        })
      });

      const result = await getDraftsAction();

      expect(result.success).toBe(false);
      expect(result.error).toBe('임시 저장된 노트 조회 중 오류가 발생했습니다.');
    });
  });

  describe('convertDraftToNoteAction', () => {
    it('converts draft to note successfully', async () => {
      // Mock draft fetch
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockResolvedValueOnce([mockDraftNotes])
        })
      });

      // Mock note creation
      mockDb.insert.mockReturnValueOnce({
        values: jest.fn().mockReturnValueOnce({
          returning: jest.fn().mockResolvedValueOnce([mockNotes])
        })
      });

      // Mock draft deletion
      mockDb.delete.mockReturnValueOnce({
        where: jest.fn().mockResolvedValueOnce({})
      });

      const result = await convertDraftToNoteAction('draft-1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockNotes);
    });

    it('handles draft not found', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockResolvedValueOnce([])
        })
      });

      const result = await convertDraftToNoteAction('nonexistent-draft');

      expect(result.success).toBe(false);
      expect(result.error).toBe('임시 저장된 노트를 찾을 수 없습니다.');
    });

    it('handles conversion error', async () => {
      mockDb.select.mockReturnValueOnce({
        from: jest.fn().mockReturnValueOnce({
          where: jest.fn().mockRejectedValueOnce(new Error('Database error'))
        })
      });

      const result = await convertDraftToNoteAction('draft-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('노트 변환 중 오류가 발생했습니다.');
    });
  });

  describe('deleteDraftAction', () => {
    it('deletes draft successfully', async () => {
      mockDb.delete.mockReturnValueOnce({
        where: jest.fn().mockResolvedValueOnce({})
      });

      const result = await deleteDraftAction('draft-1');

      expect(result.success).toBe(true);
    });

    it('handles deletion error', async () => {
      mockDb.delete.mockReturnValueOnce({
        where: jest.fn().mockRejectedValueOnce(new Error('Database error'))
      });

      const result = await deleteDraftAction('draft-1');

      expect(result.success).toBe(false);
      expect(result.error).toBe('임시 노트 삭제 중 오류가 발생했습니다.');
    });
  });

  describe('cleanupExpiredDrafts', () => {
    it('cleans up expired drafts successfully', async () => {
      mockDb.delete.mockReturnValueOnce({
        where: jest.fn().mockResolvedValueOnce({ rowCount: 5 })
      });

      const result = await cleanupExpiredDrafts();

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(5);
    });

    it('handles cleanup error', async () => {
      mockDb.delete.mockReturnValueOnce({
        where: jest.fn().mockRejectedValueOnce(new Error('Database error'))
      });

      const result = await cleanupExpiredDrafts();

      expect(result.success).toBe(false);
      expect(result.error).toBe('만료된 임시 노트 정리 중 오류가 발생했습니다.');
    });
  });
});
