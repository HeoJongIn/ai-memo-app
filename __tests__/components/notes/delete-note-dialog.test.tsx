// __tests__/components/notes/delete-note-dialog.test.tsx
// 노트 삭제 다이얼로그 컴포넌트 테스트
// 다이얼로그 표시, 삭제 확인, 에러 처리를 테스트
// 노트 제목 표시 및 개선된 UI 테스트 포함
// Jest와 React Testing Library를 사용한 단위 테스트

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteNoteDialog } from '@/components/notes/delete-note-dialog';

// Mock 설정
jest.mock('@/lib/actions/notes', () => ({
  deleteNoteAction: jest.fn(),
}));

jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    addToast: jest.fn(),
  }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const mockDeleteNoteAction = require('@/lib/actions/notes').deleteNoteAction;

describe('DeleteNoteDialog', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog with note title when open is true', () => {
    render(
      <DeleteNoteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        noteId="note-1"
        noteTitle="Test Note Title"
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('노트 삭제 확인')).toBeInTheDocument();
    expect(screen.getByText('다음 노트를 삭제하시겠습니까?')).toBeInTheDocument();
    expect(screen.getByText('"Test Note Title"')).toBeInTheDocument();
    expect(screen.getByText('⚠️ 이 작업은 되돌릴 수 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('취소')).toBeInTheDocument();
    expect(screen.getByText('삭제')).toBeInTheDocument();
  });

  it('does not render dialog when open is false', () => {
    render(
      <DeleteNoteDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        noteId="note-1"
        noteTitle="Test Note Title"
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.queryByText('노트 삭제 확인')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when cancel button is clicked', () => {
    render(
      <DeleteNoteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        noteId="note-1"
        noteTitle="Test Note Title"
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('취소'));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls deleteNoteAction and onConfirm when delete button is clicked', async () => {
    mockDeleteNoteAction.mockResolvedValue({
      success: true,
      data: { id: 'note-1' },
    });

    render(
      <DeleteNoteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        noteId="note-1"
        noteTitle="Test Note Title"
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('삭제'));

    await waitFor(() => {
      expect(mockDeleteNoteAction).toHaveBeenCalledWith('note-1');
    });

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('shows loading state during deletion', async () => {
    mockDeleteNoteAction.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: {} }), 100))
    );

    render(
      <DeleteNoteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        noteId="note-1"
        noteTitle="Test Note Title"
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('삭제'));

    expect(screen.getByText('삭제 중...')).toBeInTheDocument();
    expect(screen.getByText('취소')).toBeDisabled();
  });

  it('disables cancel button during deletion', async () => {
    mockDeleteNoteAction.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: {} }), 100))
    );

    render(
      <DeleteNoteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        noteId="note-1"
        noteTitle="Test Note Title"
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('삭제'));

    const cancelButton = screen.getByText('취소');
    expect(cancelButton).toBeDisabled();
  });

  it('shows spinner animation during deletion', async () => {
    mockDeleteNoteAction.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: {} }), 100))
    );

    render(
      <DeleteNoteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        noteId="note-1"
        noteTitle="Test Note Title"
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('삭제'));

    // 스피너 애니메이션 요소 확인
    const spinner = screen.getByRole('button', { name: /삭제 중/ });
    expect(spinner).toBeInTheDocument();
  });

  it('handles deletion error gracefully', async () => {
    mockDeleteNoteAction.mockResolvedValue({
      success: false,
      error: 'Deletion failed',
    });

    render(
      <DeleteNoteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        noteId="note-1"
        noteTitle="Test Note Title"
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('삭제'));

    await waitFor(() => {
      expect(mockDeleteNoteAction).toHaveBeenCalledWith('note-1');
    });

    // 에러 시 다이얼로그가 닫히지 않아야 함
    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('prevents dialog close during deletion', async () => {
    mockDeleteNoteAction.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: {} }), 100))
    );

    render(
      <DeleteNoteDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        noteId="note-1"
        noteTitle="Test Note Title"
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('삭제'));

    // 삭제 중에는 다이얼로그가 닫히지 않아야 함
    expect(mockOnOpenChange).not.toHaveBeenCalledWith(false);
  });
});