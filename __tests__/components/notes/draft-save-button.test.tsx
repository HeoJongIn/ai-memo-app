// __tests__/components/notes/draft-save-button.test.tsx
// 임시 저장 버튼 컴포넌트 테스트
// 버튼 렌더링, 클릭 이벤트, 상태 변화를 테스트
// Jest와 React Testing Library를 사용한 단위 테스트

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DraftSaveButton } from '@/components/notes/draft-save-button';

// Mock 설정
jest.mock('@/lib/actions/notes', () => ({
  saveDraftAction: jest.fn(),
}));

jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    addToast: jest.fn(),
  }),
}));

import { saveDraftAction } from '@/lib/actions/notes';

const mockSaveDraftAction = saveDraftAction as jest.MockedFunction<typeof saveDraftAction>;

describe('DraftSaveButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders draft save button with correct text', () => {
    render(<DraftSaveButton title="Test Title" content="Test Content" />);

    expect(screen.getByRole('button', { name: '임시 저장' })).toBeInTheDocument();
    expect(screen.getByText('임시 저장')).toBeInTheDocument();
  });

  it('shows loading state when saving', async () => {
    mockSaveDraftAction.mockResolvedValueOnce({ success: true, data: { id: '1' } });

    render(<DraftSaveButton title="Test Title" content="Test Content" />);

    const button = screen.getByRole('button', { name: '임시 저장' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('저장 중...')).toBeInTheDocument();
    });
  });

  it('shows success state after successful save', async () => {
    mockSaveDraftAction.mockResolvedValueOnce({ success: true, data: { id: '1' } });

    render(<DraftSaveButton title="Test Title" content="Test Content" />);

    const button = screen.getByRole('button', { name: '임시 저장' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('저장됨')).toBeInTheDocument();
    });
  });

  it('handles save error gracefully', async () => {
    mockSaveDraftAction.mockResolvedValueOnce({ 
      success: false, 
      error: 'Save failed' 
    });

    render(<DraftSaveButton title="Test Title" content="Test Content" />);

    const button = screen.getByRole('button', { name: '임시 저장' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText('임시 저장')).toBeInTheDocument();
    });
  });

  it('is disabled when disabled prop is true', () => {
    render(<DraftSaveButton title="Test Title" content="Test Content" disabled={true} />);

    const button = screen.getByRole('button', { name: '임시 저장' });
    expect(button).toBeDisabled();
  });

  it('calls saveDraftAction with correct parameters', async () => {
    mockSaveDraftAction.mockResolvedValueOnce({ success: true, data: { id: '1' } });

    render(<DraftSaveButton title="Test Title" content="Test Content" />);

    const button = screen.getByRole('button', { name: '임시 저장' });
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSaveDraftAction).toHaveBeenCalledWith('Test Title', 'Test Content');
    });
  });

  it('handles empty title and content', async () => {
    render(<DraftSaveButton title="" content="" />);

    const button = screen.getByRole('button', { name: '임시 저장' });
    fireEvent.click(button);

    // Should not call saveDraftAction for empty content
    expect(mockSaveDraftAction).not.toHaveBeenCalled();
  });

  it('handles whitespace-only title and content', async () => {
    render(<DraftSaveButton title="   " content="   " />);

    const button = screen.getByRole('button', { name: '임시 저장' });
    fireEvent.click(button);

    // Should not call saveDraftAction for whitespace-only content
    expect(mockSaveDraftAction).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(
      <DraftSaveButton 
        title="Test Title" 
        content="Test Content" 
        className="custom-class" 
      />
    );

    const button = screen.getByRole('button', { name: '임시 저장' });
    expect(button).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(<DraftSaveButton title="Test Title" content="Test Content" />);

    const button = screen.getByRole('button', { name: '임시 저장' });
    expect(button).toHaveAttribute('aria-label', '임시 저장');
  });
});
