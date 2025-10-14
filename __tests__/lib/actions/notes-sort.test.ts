// __tests__/lib/actions/notes-sort.test.ts
// 노트 정렬 서버 액션 테스트
// getUserNotesPaginated 함수의 정렬 기능을 테스트
// Jest를 사용한 단위 테스트

import { getUserNotesPaginated } from '@/lib/actions/notes';

// Mock 설정
jest.mock('@/lib/db', () => ({
  db: {
    select: jest.fn(() => ({
      from: jest.fn(() => ({
        where: jest.fn(() => ({
          orderBy: jest.fn(() => ({
            limit: jest.fn(() => ({
              offset: jest.fn(() => Promise.resolve([
                {
                  id: '1',
                  userId: 'user1',
                  title: 'Test Note 1',
                  content: 'Content 1',
                  createdAt: new Date('2024-01-01'),
                  updatedAt: new Date('2024-01-01'),
                },
                {
                  id: '2',
                  userId: 'user1',
                  title: 'Test Note 2',
                  content: 'Content 2',
                  createdAt: new Date('2024-01-02'),
                  updatedAt: new Date('2024-01-02'),
                },
              ]))
            }))
          }))
        }))
      }))
    }))
  }
}));

jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
  desc: jest.fn(),
  asc: jest.fn(),
  sql: jest.fn((template) => template),
}));

describe('getUserNotesPaginated with sorting', () => {
  const mockUserId = 'user1';
  const mockPage = 1;
  const mockLimit = 10;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sorts by latest (default)', async () => {
    const result = await getUserNotesPaginated(mockUserId, mockPage, mockLimit, 'latest');

    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('notes');
    expect(result.data).toHaveProperty('pagination');
    expect(result.data).toHaveProperty('sortBy', 'latest');
  });

  it('sorts by title', async () => {
    const result = await getUserNotesPaginated(mockUserId, mockPage, mockLimit, 'title');

    expect(result.success).toBe(true);
    expect(result.data.sortBy).toBe('title');
  });

  it('sorts by oldest', async () => {
    const result = await getUserNotesPaginated(mockUserId, mockPage, mockLimit, 'oldest');

    expect(result.success).toBe(true);
    expect(result.data.sortBy).toBe('oldest');
  });

  it('uses default sort when no sortBy provided', async () => {
    const result = await getUserNotesPaginated(mockUserId, mockPage, mockLimit);

    expect(result.success).toBe(true);
    expect(result.data.sortBy).toBe('latest');
  });

  it('handles invalid sort option gracefully', async () => {
    const result = await getUserNotesPaginated(mockUserId, mockPage, mockLimit, 'invalid' as any);

    expect(result.success).toBe(true);
    expect(result.data.sortBy).toBe('latest'); // 기본값으로 폴백
  });

  it('returns correct pagination info', async () => {
    const result = await getUserNotesPaginated(mockUserId, mockPage, mockLimit, 'latest');

    expect(result.data.pagination).toHaveProperty('currentPage', mockPage);
    expect(result.data.pagination).toHaveProperty('limit', mockLimit);
    expect(result.data.pagination).toHaveProperty('totalCount');
    expect(result.data.pagination).toHaveProperty('totalPages');
    expect(result.data.pagination).toHaveProperty('hasNext');
    expect(result.data.pagination).toHaveProperty('hasPrev');
  });

  it('handles database errors gracefully', async () => {
    // Mock database error
    const mockDb = require('@/lib/db').db;
    mockDb.select.mockImplementation(() => {
      throw new Error('Database error');
    });

    const result = await getUserNotesPaginated(mockUserId, mockPage, mockLimit, 'latest');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Failed to fetch notes');
  });
});
