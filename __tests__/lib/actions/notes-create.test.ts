// __tests__/lib/actions/notes-create.test.ts
// 노트 생성 서버 액션 테스트
// 사용자 인증, 데이터 유효성 검증, 데이터베이스 저장을 테스트
// Jest를 사용한 서버 액션 단위 테스트

import { createNoteAction } from '@/lib/actions/notes';

// Mock dependencies
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  db: {
    insert: jest.fn(),
  },
}));

const mockCreateServerClient = jest.fn();

describe('createNoteAction', () => {
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

    const result = await createNoteAction('Test Title', 'Test Content');

    expect(result).toEqual({
      success: false,
      error: '로그인이 필요합니다.',
    });
  });

  it('returns error when title is empty', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    const result = await createNoteAction('', 'Test Content');

    expect(result).toEqual({
      success: false,
      error: '제목을 입력해주세요.',
    });
  });

  it('returns error when content is empty', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    const result = await createNoteAction('Test Title', '');

    expect(result).toEqual({
      success: false,
      error: '본문을 입력해주세요.',
    });
  });

  it('returns error when title is too long', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });

    const longTitle = 'a'.repeat(256);
    const result = await createNoteAction(longTitle, 'Test Content');

    expect(result).toEqual({
      success: false,
      error: '제목은 255자를 초과할 수 없습니다.',
    });
  });
});
