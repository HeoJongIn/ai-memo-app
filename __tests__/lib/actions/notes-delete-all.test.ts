// __tests__/lib/actions/notes-delete-all.test.ts
// deleteAllNotesAction 서버 액션에 대한 단위 테스트
// 사용자 인증, 모든 노트 삭제 로직, 에러 처리 등을 검증

import { deleteAllNotesAction } from '@/lib/actions/notes';
import { db } from '@/lib/db';
import { notes } from '@/drizzle/schema';

// Mock dependencies
jest.mock('@/lib/db', () => ({
  db: {
    delete: jest.fn(),
  },
}));

jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

const mockDb = {
  delete: jest.fn(),
};

const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
  },
};

const mockCreateServerClient = jest.fn(() => mockSupabaseClient);

describe('deleteAllNotesAction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the db module
    jest.doMock('@/lib/db', () => ({ db: mockDb }));
    require('@supabase/ssr').createServerClient = mockCreateServerClient;
  });

  it('successfully deletes all notes for authenticated user', async () => {
    const mockUser = { id: 'user-123' };
    const mockDeletedNotes = [
      { id: 'note-1' },
      { id: 'note-2' },
    ];

    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    (mockDb.delete as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue(mockDeletedNotes),
    });

    const result = await deleteAllNotesAction();

    expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1);
    expect(mockDb.delete).toHaveBeenCalledWith(notes);
    expect(mockDb.delete().where).toHaveBeenCalledWith(expect.any(Object)); // eq(notes.userId, user.id)
    expect(result).toEqual({
      success: true,
      data: {
        deletedCount: mockDeletedNotes.length,
        deletedNoteIds: mockDeletedNotes.map(note => note.id),
      },
    });
  });

  it('returns error when user is not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

    const result = await deleteAllNotesAction();

    expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1);
    expect(mockDb.delete).not.toHaveBeenCalled();
    expect(result).toEqual({ success: false, error: '로그인이 필요합니다.' });
  });

  it('returns error when authentication fails', async () => {
    const mockAuthError = new Error('Auth failed');
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: mockAuthError });

    const result = await deleteAllNotesAction();

    expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1);
    expect(mockDb.delete).not.toHaveBeenCalled();
    expect(result).toEqual({ success: false, error: '로그인이 필요합니다.' });
  });

  it('handles database error gracefully', async () => {
    const mockUser = { id: 'user-123' };
    const mockDbError = new Error('Database error');

    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    (mockDb.delete as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnThis(),
      returning: jest.fn().mockRejectedValue(mockDbError),
    });

    const result = await deleteAllNotesAction();

    expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1);
    expect(mockDb.delete).toHaveBeenCalledWith(notes);
    expect(result).toEqual({ success: false, error: '모든 노트 삭제 중 오류가 발생했습니다.' });
  });

  it('handles empty result gracefully', async () => {
    const mockUser = { id: 'user-123' };

    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    (mockDb.delete as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]), // No notes deleted
    });

    const result = await deleteAllNotesAction();

    expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1);
    expect(mockDb.delete).toHaveBeenCalledWith(notes);
    expect(result).toEqual({
      success: true,
      data: {
        deletedCount: 0,
        deletedNoteIds: [],
      },
    });
  });
});

