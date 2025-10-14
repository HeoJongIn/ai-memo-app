// __tests__/components/notes/cancel-edit-dialog.test.tsx
// 노트 수정 취소 다이얼로그 컴포넌트 테스트
// 다이얼로그 표시, 취소 확인을 테스트
// Jest와 React Testing Library를 사용한 단위 테스트

import { render, screen, fireEvent } from '@testing-library/react';
import { CancelEditDialog } from '@/components/notes/cancel-edit-dialog';

describe('CancelEditDialog', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders dialog when open is true', () => {
    render(
      <CancelEditDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText('수정 취소 확인')).toBeInTheDocument();
    expect(screen.getByText(/저장되지 않은 변경사항이 있습니다/)).toBeInTheDocument();
    expect(screen.getByText('계속 수정')).toBeInTheDocument();
    expect(screen.getByText('취소하고 나가기')).toBeInTheDocument();
  });

  it('does not render dialog when open is false', () => {
    render(
      <CancelEditDialog
        open={false}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.queryByText('수정 취소 확인')).not.toBeInTheDocument();
  });

  it('calls onOpenChange when continue editing button is clicked', () => {
    render(
      <CancelEditDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('계속 수정'));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockOnConfirm).not.toHaveBeenCalled();
  });

  it('calls onConfirm when cancel and exit button is clicked', () => {
    render(
      <CancelEditDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('취소하고 나가기'));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('shows warning about data loss', () => {
    render(
      <CancelEditDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText(/취소하면 변경사항이 모두 사라집니다/)).toBeInTheDocument();
  });

  it('applies correct styling to warning text', () => {
    render(
      <CancelEditDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    const warningText = screen.getByText(/취소하면 변경사항이 모두 사라집니다/);
    expect(warningText).toHaveClass('text-red-600', 'dark:text-red-400', 'font-medium');
  });

  it('applies correct styling to title', () => {
    render(
      <CancelEditDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    const title = screen.getByText('수정 취소 확인');
    expect(title).toHaveClass('text-orange-600', 'dark:text-orange-400');
  });

  it('applies correct styling to cancel button', () => {
    render(
      <CancelEditDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        onConfirm={mockOnConfirm}
      />
    );

    const cancelButton = screen.getByText('취소하고 나가기');
    expect(cancelButton).toHaveClass('bg-red-600', 'hover:bg-red-700');
  });
});

