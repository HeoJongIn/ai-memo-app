// __tests__/components/notes/delete-all-notes-dialog.test.tsx
// DeleteAllNotesDialog 컴포넌트에 대한 단위 테스트
// 다이얼로그 렌더링, 버튼 클릭, 로딩 상태, 성공/실패 처리 등을 검증

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteAllNotesDialog } from '@/components/notes/delete-all-notes-dialog';
import { deleteAllNotesAction } from '@/lib/actions/notes';

// Mock dependencies
jest.mock('@/lib/actions/notes', () => ({
  deleteAllNotesAction: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    addToast: jest.fn(),
  }),
}));

const mockDeleteAllNotesAction = deleteAllNotesAction as jest.MockedFunction<typeof deleteAllNotesAction>;

describe('DeleteAllNotesDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: jest.fn(),
    onSuccess: jest.fn(),
    noteCount: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog with correct content', () => {
    render(<DeleteAllNotesDialog {...defaultProps} />);

    expect(screen.getByRole('heading', { name: '모든 노트 삭제' })).toBeInTheDocument();
    expect(screen.getByText('⚠️ 이 작업은 되돌릴 수 없습니다!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '모든 노트 삭제' })).toBeInTheDocument();
  });

  it('calls onOpenChange when cancel button is clicked', () => {
    render(<DeleteAllNotesDialog {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: '취소' });
    fireEvent.click(cancelButton);

    expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls deleteAllNotesAction when delete button is clicked', async () => {
    mockDeleteAllNotesAction.mockResolvedValue({
      success: true,
      data: { deletedCount: 5, deletedNoteIds: ['1', '2', '3', '4', '5'] },
    });

    render(<DeleteAllNotesDialog {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: '모든 노트 삭제' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteAllNotesAction).toHaveBeenCalledTimes(1);
    });
  });

  it('shows loading state during deletion', async () => {
    mockDeleteAllNotesAction.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, data: { deletedCount: 5, deletedNoteIds: [] } }), 100))
    );

    render(<DeleteAllNotesDialog {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: '모든 노트 삭제' });
    fireEvent.click(deleteButton);

    expect(screen.getByText('삭제 중...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '삭제 중...' })).toBeDisabled();
  });

  it('handles successful deletion', async () => {
    mockDeleteAllNotesAction.mockResolvedValue({
      success: true,
      data: { deletedCount: 5, deletedNoteIds: ['1', '2', '3', '4', '5'] },
    });

    render(<DeleteAllNotesDialog {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: '모든 노트 삭제' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(defaultProps.onSuccess).toHaveBeenCalledTimes(1);
      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('handles deletion failure', async () => {
    mockDeleteAllNotesAction.mockResolvedValue({
      success: false,
      error: '삭제 실패',
    });

    render(<DeleteAllNotesDialog {...defaultProps} />);

    const deleteButton = screen.getByRole('button', { name: '모든 노트 삭제' });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(defaultProps.onSuccess).not.toHaveBeenCalled();
      expect(defaultProps.onOpenChange).not.toHaveBeenCalledWith(false);
    });
  });

  it('disables delete button when noteCount is 0', () => {
    render(<DeleteAllNotesDialog {...defaultProps} noteCount={0} />);

    const deleteButton = screen.getByRole('button', { name: '모든 노트 삭제' });
    expect(deleteButton).toBeDisabled();
  });

  it('displays correct note count in dialog', () => {
    render(<DeleteAllNotesDialog {...defaultProps} noteCount={10} />);

    expect(screen.getByText('모든 노트(10개)')).toBeInTheDocument();
  });
});

