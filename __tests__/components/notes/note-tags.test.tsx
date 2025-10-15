// __tests__/components/notes/note-tags.test.tsx
// NoteTags 컴포넌트 테스트
// 태그 표시, 생성, 덮어쓰기 기능에 대한 포괄적인 테스트
// 사용자 인터랙션, 로딩 상태, 에러 핸들링 시나리오 포함

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NoteTags } from '@/components/notes/note-tags';
import { generateTagsAction } from '@/lib/actions/ai';
import { getTagsAction } from '@/lib/actions/notes';

// Mock dependencies
jest.mock('@/lib/actions/ai');
jest.mock('@/lib/actions/notes');
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    addToast: jest.fn(),
  }),
}));

const mockGenerateTagsAction = generateTagsAction as jest.MockedFunction<typeof generateTagsAction>;
const mockGetTagsAction = getTagsAction as jest.MockedFunction<typeof getTagsAction>;

describe('NoteTags', () => {
  const mockNoteId = 'test-note-id';
  const mockOnTagsGenerated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetTagsAction.mockResolvedValue({
      success: true,
      data: [],
    });
  });

  describe('기본 렌더링', () => {
    it('태그 섹션과 AI 태그 생성 버튼을 렌더링한다', () => {
      render(<NoteTags noteId={mockNoteId} onTagsGenerated={mockOnTagsGenerated} />);
      
      expect(screen.getByText('태그')).toBeInTheDocument();
      expect(screen.getByText('AI 태그 생성')).toBeInTheDocument();
    });

    it('태그가 없을 때 안내 메시지를 표시한다', () => {
      render(<NoteTags noteId={mockNoteId} onTagsGenerated={mockOnTagsGenerated} />);
      
      expect(screen.getByText('아직 태그가 없습니다. AI 태그 생성 버튼을 클릭하여 관련 태그를 자동으로 생성해보세요.')).toBeInTheDocument();
    });

    it('기존 태그가 있을 때 태그를 표시한다', () => {
      const existingTags = ['태그1', '태그2', '태그3'];
      render(<NoteTags noteId={mockNoteId} existingTags={existingTags} onTagsGenerated={mockOnTagsGenerated} />);
      
      existingTags.forEach(tag => {
        expect(screen.getByText(tag)).toBeInTheDocument();
      });
    });
  });

  describe('태그 생성 기능', () => {
    it('태그 생성 버튼 클릭 시 태그를 생성한다', async () => {
      const mockTags = ['AI', '자동화', '태그'];
      mockGenerateTagsAction.mockResolvedValue({
        success: true,
        data: { tags: mockTags },
      });

      render(<NoteTags noteId={mockNoteId} onTagsGenerated={mockOnTagsGenerated} />);
      
      const generateButton = screen.getByText('AI 태그 생성');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockGenerateTagsAction).toHaveBeenCalledWith(mockNoteId);
      });

      await waitFor(() => {
        expect(screen.getByText('AI')).toBeInTheDocument();
        expect(screen.getByText('자동화')).toBeInTheDocument();
        // 태그는 헤더, 상태 표시, 배지에 있으므로 getAllByText 사용
        expect(screen.getAllByText('태그')).toHaveLength(3);
      });

      expect(mockOnTagsGenerated).toHaveBeenCalledWith(mockTags);
    });

    it('태그 생성 중 로딩 상태를 표시한다', async () => {
      mockGenerateTagsAction.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { tags: ['테스트'] },
        }), 100))
      );

      render(<NoteTags noteId={mockNoteId} onTagsGenerated={mockOnTagsGenerated} />);
      
      const generateButton = screen.getByText('AI 태그 생성');
      fireEvent.click(generateButton);

      expect(screen.getByText('생성 중...')).toBeInTheDocument();
      expect(generateButton).toBeDisabled();
    });

    it('태그 생성 실패 시 에러를 처리한다', async () => {
      mockGenerateTagsAction.mockResolvedValue({
        success: false,
        error: '태그 생성 실패',
      });

      render(<NoteTags noteId={mockNoteId} onTagsGenerated={mockOnTagsGenerated} />);
      
      const generateButton = screen.getByText('AI 태그 생성');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockGenerateTagsAction).toHaveBeenCalledWith(mockNoteId);
      });

      // 에러 토스트는 useToast mock으로 처리됨
      expect(mockOnTagsGenerated).not.toHaveBeenCalled();
    });
  });

  describe('재생성 기능', () => {
    it('기존 태그가 있을 때 재생성 버튼만 표시한다', () => {
      const existingTags = ['기존태그1', '기존태그2'];
      render(<NoteTags noteId={mockNoteId} existingTags={existingTags} onTagsGenerated={mockOnTagsGenerated} />);
      
      expect(screen.getByText('태그 재생성')).toBeInTheDocument();
      expect(screen.queryByText('AI 태그 생성')).not.toBeInTheDocument();
    });

    it('재생성 버튼 클릭 시 태그를 재생성한다', async () => {
      const existingTags = ['기존태그1', '기존태그2'];
      const newTags = ['새태그1', '새태그2', '새태그3'];
      
      // 초기 로드 시 기존 태그 반환하도록 설정
      mockGetTagsAction.mockResolvedValue({
        success: true,
        data: existingTags,
      });
      
      mockGenerateTagsAction.mockResolvedValue({
        success: true,
        data: { tags: newTags },
      });

      render(<NoteTags noteId={mockNoteId} existingTags={existingTags} onTagsGenerated={mockOnTagsGenerated} />);
      
      // 초기 로드 완료 대기
      await waitFor(() => {
        expect(mockGetTagsAction).toHaveBeenCalledWith(mockNoteId);
      });
      
      const regenerateButton = screen.getByText('태그 재생성');
      fireEvent.click(regenerateButton);

      // 다이얼로그에서 재생성 확인
      const confirmButton = screen.getByText('재생성');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockGenerateTagsAction).toHaveBeenCalledWith(mockNoteId);
      });

      await waitFor(() => {
        newTags.forEach(tag => {
          expect(screen.getByText(tag)).toBeInTheDocument();
        });
      });

      expect(mockOnTagsGenerated).toHaveBeenCalledWith(newTags);
    });

    it('재생성 중 로딩 상태를 표시한다', async () => {
      const existingTags = ['기존태그'];
      
      // 초기 로드 시 기존 태그 반환하도록 설정
      mockGetTagsAction.mockResolvedValue({
        success: true,
        data: existingTags,
      });
      
      mockGenerateTagsAction.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { tags: ['새태그'] },
        }), 100))
      );

      render(<NoteTags noteId={mockNoteId} existingTags={existingTags} onTagsGenerated={mockOnTagsGenerated} />);
      
      // 초기 로드 완료 대기
      await waitFor(() => {
        expect(mockGetTagsAction).toHaveBeenCalledWith(mockNoteId);
      });
      
      const regenerateButton = screen.getByText('태그 재생성');
      fireEvent.click(regenerateButton);

      // 다이얼로그에서 재생성 확인
      const confirmButton = screen.getByText('재생성');
      fireEvent.click(confirmButton);

      expect(screen.getByText('재생성 중...')).toBeInTheDocument();
      expect(regenerateButton).toBeDisabled();
    });

    it('재생성 실패 시 기존 태그를 유지한다', async () => {
      const existingTags = ['기존태그1', '기존태그2'];
      
      // 초기 로드 시 기존 태그 반환하도록 설정
      mockGetTagsAction.mockResolvedValue({
        success: true,
        data: existingTags,
      });
      
      mockGenerateTagsAction.mockResolvedValue({
        success: false,
        error: '재생성 실패',
      });

      render(<NoteTags noteId={mockNoteId} existingTags={existingTags} onTagsGenerated={mockOnTagsGenerated} />);
      
      // 초기 로드 완료 대기
      await waitFor(() => {
        expect(mockGetTagsAction).toHaveBeenCalledWith(mockNoteId);
      });
      
      const regenerateButton = screen.getByText('태그 재생성');
      fireEvent.click(regenerateButton);

      // 다이얼로그에서 재생성 확인
      const confirmButton = screen.getByText('재생성');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockGenerateTagsAction).toHaveBeenCalledWith(mockNoteId);
      });

      // 기존 태그가 유지되어야 함
      await waitFor(() => {
        existingTags.forEach(tag => {
          expect(screen.getByText(tag)).toBeInTheDocument();
        });
      });

      // 에러 메시지가 표시되어야 함
      await waitFor(() => {
        expect(screen.queryByText(/재생성 실패/)).toBeInTheDocument();
      });
    });
  });

  describe('덮어쓰기 기능', () => {
    it('기존 태그가 있을 때 덮어쓰기 확인 다이얼로그를 표시한다', () => {
      const existingTags = ['기존태그1', '기존태그2'];
      render(<NoteTags noteId={mockNoteId} existingTags={existingTags} onTagsGenerated={mockOnTagsGenerated} />);
      
      // 재생성 버튼 클릭 (기존 태그가 있을 때는 재생성 버튼만 보임)
      const regenerateButton = screen.getByText('태그 재생성');
      fireEvent.click(regenerateButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('이미 2개의 태그가 있습니다. 새로운 태그로 재생성하시겠습니까?')).toBeInTheDocument();
    });

    it('덮어쓰기 확인 시 태그를 생성한다', async () => {
      const existingTags = ['기존태그'];
      const newTags = ['새태그1', '새태그2'];
      
      mockGenerateTagsAction.mockResolvedValue({
        success: true,
        data: { tags: newTags },
      });

      render(<NoteTags noteId={mockNoteId} existingTags={existingTags} onTagsGenerated={mockOnTagsGenerated} />);
      
      const regenerateButton = screen.getByText('태그 재생성');
      fireEvent.click(regenerateButton);

      const confirmButton = screen.getByText('재생성');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockGenerateTagsAction).toHaveBeenCalledWith(mockNoteId);
      });

      await waitFor(() => {
        newTags.forEach(tag => {
          expect(screen.getByText(tag)).toBeInTheDocument();
        });
      });
    });

    it('덮어쓰기 취소 시 기존 태그를 유지한다', () => {
      const existingTags = ['기존태그1', '기존태그2'];
      render(<NoteTags noteId={mockNoteId} existingTags={existingTags} onTagsGenerated={mockOnTagsGenerated} />);
      
      const regenerateButton = screen.getByText('태그 재생성');
      fireEvent.click(regenerateButton);

      const cancelButton = screen.getByText('취소');
      fireEvent.click(cancelButton);

      expect(mockGenerateTagsAction).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('에러 핸들링', () => {
    it('API 호출 중 예외 발생 시 에러를 처리한다', async () => {
      // 초기 로드 시 빈 배열 반환하도록 설정
      mockGetTagsAction.mockResolvedValue({
        success: true,
        data: [],
      });
      
      // beforeEach에서 설정한 mock을 완전히 오버라이드
      mockGenerateTagsAction.mockRejectedValue(new Error('Network error'));

      render(<NoteTags noteId={mockNoteId} onTagsGenerated={mockOnTagsGenerated} />);
      
      // 초기 로드 완료 대기
      await waitFor(() => {
        expect(mockGetTagsAction).toHaveBeenCalledWith(mockNoteId);
      });
      
      
      const generateButton = screen.getByText('AI 태그 생성');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(mockGenerateTagsAction).toHaveBeenCalledWith(mockNoteId);
      });

      // 에러 메시지가 표시되어야 함
      await waitFor(() => {
        expect(screen.queryByText(/예상치 못한 오류가 발생했습니다/)).toBeInTheDocument();
      });
    });

    it('태그 조회 실패 시 에러를 처리한다', async () => {
      mockGetTagsAction.mockResolvedValue({
        success: false,
        error: '태그 조회 실패',
      });

      render(<NoteTags noteId={mockNoteId} onTagsGenerated={mockOnTagsGenerated} />);

      await waitFor(() => {
        expect(mockGetTagsAction).toHaveBeenCalledWith(mockNoteId);
      });

      // 에러가 발생해도 컴포넌트는 정상 렌더링되어야 함
      expect(screen.getByText('AI 태그 생성')).toBeInTheDocument();
    });
  });

  describe('사용자 인터랙션', () => {
    it('태그 생성 중 버튼이 비활성화된다', async () => {
      mockGenerateTagsAction.mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          success: true,
          data: { tags: ['테스트'] },
        }), 100))
      );

      render(<NoteTags noteId={mockNoteId} onTagsGenerated={mockOnTagsGenerated} />);
      
      const generateButton = screen.getByText('AI 태그 생성');
      fireEvent.click(generateButton);

      expect(generateButton).toBeDisabled();
      
      await waitFor(() => {
        expect(generateButton).not.toBeDisabled();
      });
    });

    it('태그 생성 완료 후 버튼이 다시 활성화된다', async () => {
      mockGenerateTagsAction.mockResolvedValue({
        success: true,
        data: { tags: ['테스트'] },
      });

      render(<NoteTags noteId={mockNoteId} onTagsGenerated={mockOnTagsGenerated} />);
      
      const generateButton = screen.getByText('AI 태그 생성');
      fireEvent.click(generateButton);

      await waitFor(() => {
        expect(generateButton).not.toBeDisabled();
        expect(screen.getByText('태그 재생성')).toBeInTheDocument();
      });
    });
  });
});
