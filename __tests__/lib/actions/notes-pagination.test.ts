// __tests__/lib/actions/notes-pagination.test.ts
// 노트 페이지네이션 서버 액션 테스트
// 페이지네이션 로직, 사용자 인증, 데이터 조회를 테스트
// Jest를 사용한 서버 액션 단위 테스트

import { getNotesAction, getUserNotesPaginated } from '@/lib/actions/notes';

// Mock dependencies
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(),
  },
}));

const mockCreateServerClient = jest.fn();

describe('getNotesAction', () => {
  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
    },
  };

  beforeEach(() => {
    mockCreateServerClient.mockReturnValue(mockSupabaseClient);
    jest.clearAllMocks();
  });

  it('returns error when user is not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error('Not authenticated'),
    });

    const result = await getNotesAction(1, 10);

    expect(result).toEqual({
      success: false,
      error: '로그인이 필요합니다.',
    });
  });

  it('successfully fetches notes with pagination', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    // Mock getUserNotesPaginated to return success
    const mockNotes = [
      { id: 'note-1', title: 'Test 1', content: 'Content 1', createdAt: new Date(), updatedAt: new Date() },
      { id: 'note-2', title: 'Test 2', content: 'Content 2', createdAt: new Date(), updatedAt: new Date() },
    ];

    const mockPagination = {
      currentPage: 1,
      totalPages: 1,
      totalCount: 2,
      limit: 10,
      hasNext: false,
      hasPrev: false,
    };

    // Mock the getUserNotesPaginated function
    jest.doMock('@/lib/actions/notes', () => ({
      ...jest.requireActual('@/lib/actions/notes'),
      getUserNotesPaginated: jest.fn().mockResolvedValue({
        success: true,
        data: {
          notes: mockNotes,
          pagination: mockPagination,
        },
      }),
    }));

    const result = await getNotesAction(1, 10);

    expect(result).toEqual({
      success: true,
      data: {
        notes: mockNotes,
        pagination: mockPagination,
      },
    });
  });

  it('handles database errors gracefully', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    // Mock getUserNotesPaginated to return error
    jest.doMock('@/lib/actions/notes', () => ({
      ...jest.requireActual('@/lib/actions/notes'),
      getUserNotesPaginated: jest.fn().mockResolvedValue({
        success: false,
        error: 'Database error',
      }),
    }));

    const result = await getNotesAction(1, 10);

    expect(result).toEqual({
      success: false,
      error: 'Database error',
    });
  });
});

describe('getUserNotesPaginated', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calculates pagination correctly', async () => {
    const mockDb = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                offset: jest.fn().mockResolvedValue([
                  { id: 'note-1', title: 'Test 1', content: 'Content 1', createdAt: new Date(), updatedAt: new Date() },
                ]),
              }),
            }),
          }),
        }),
      }),
    };

    // Mock the db module
    jest.doMock('@/lib/db', () => ({
      db: mockDb,
    }));

    // Mock the count query
    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ count: 25 }]),
      }),
    });

    const result = await getUserNotesPaginated('user-1', 2, 10);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.pagination.currentPage).toBe(2);
      expect(result.data.pagination.totalPages).toBe(3);
      expect(result.data.pagination.totalCount).toBe(25);
      expect(result.data.pagination.hasNext).toBe(true);
      expect(result.data.pagination.hasPrev).toBe(true);
    }
  });

  it('handles empty results', async () => {
    const mockDb = {
      select: jest.fn().mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            orderBy: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                offset: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      }),
    };

    // Mock the db module
    jest.doMock('@/lib/db', () => ({
      db: mockDb,
    }));

    // Mock the count query
    mockDb.select.mockReturnValueOnce({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ count: 0 }]),
      }),
    });

    const result = await getUserNotesPaginated('user-1', 1, 10);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.notes).toHaveLength(0);
      expect(result.data.pagination.totalCount).toBe(0);
      expect(result.data.pagination.totalPages).toBe(0);
    }
  });
});

