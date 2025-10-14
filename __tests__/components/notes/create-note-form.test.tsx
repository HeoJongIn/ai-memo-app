// __tests__/components/notes/create-note-form.test.tsx
// 노트 생성 폼 컴포넌트 테스트
// 사용자 상호작용, 폼 검증, 서버 액션 호출을 테스트
// Jest와 React Testing Library를 사용한 단위 테스트

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { CreateNoteForm } from '@/components/notes/create-note-form';
import { createNoteAction } from '@/lib/actions/notes';

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/actions/notes', () => ({
  createNoteAction: jest.fn(),
}));

// Mock toast hook
const mockAddToast = jest.fn();
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
};

const mockCreateNoteAction = createNoteAction as jest.MockedFunction<typeof createNoteAction>;

describe('CreateNoteForm', () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('renders form elements correctly', () => {
    render(<CreateNoteForm />);
    
    expect(screen.getByLabelText('제목')).toBeInTheDocument();
    expect(screen.getByLabelText('본문')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '노트 저장' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  it('updates input values when user types', () => {
    render(<CreateNoteForm />);
    
    const titleInput = screen.getByLabelText('제목');
    const contentInput = screen.getByLabelText('본문');
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(contentInput, { target: { value: 'Test Content' } });
    
    expect(titleInput).toHaveValue('Test Title');
    expect(contentInput).toHaveValue('Test Content');
  });

  it('shows validation error when submitting empty form', async () => {
    render(<CreateNoteForm />);
    
    const submitButton = screen.getByRole('button', { name: '노트 저장' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        title: '입력 오류',
        description: '제목과 본문을 모두 입력해주세요.',
        variant: 'destructive',
      });
    });
  });

  it('calls createNoteAction when form is submitted with valid data', async () => {
    mockCreateNoteAction.mockResolvedValue({
      success: true,
      data: { id: '1', title: 'Test', content: 'Test Content' },
    });

    render(<CreateNoteForm />);
    
    const titleInput = screen.getByLabelText('제목');
    const contentInput = screen.getByLabelText('본문');
    const submitButton = screen.getByRole('button', { name: '노트 저장' });
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(contentInput, { target: { value: 'Test Content' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockCreateNoteAction).toHaveBeenCalledWith('Test Title', 'Test Content');
    });
  });

  it('shows success message and redirects on successful creation', async () => {
    mockCreateNoteAction.mockResolvedValue({
      success: true,
      data: { id: '1', title: 'Test', content: 'Test Content' },
    });

    render(<CreateNoteForm />);
    
    const titleInput = screen.getByLabelText('제목');
    const contentInput = screen.getByLabelText('본문');
    const submitButton = screen.getByRole('button', { name: '노트 저장' });
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(contentInput, { target: { value: 'Test Content' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        title: '성공',
        description: '노트가 성공적으로 생성되었습니다.',
        variant: 'success',
      });
    });

    // Check redirect after timeout
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/notes');
    }, { timeout: 2000 });
  });

  it('shows error message when creation fails', async () => {
    mockCreateNoteAction.mockResolvedValue({
      success: false,
      error: 'Creation failed',
    });

    render(<CreateNoteForm />);
    
    const titleInput = screen.getByLabelText('제목');
    const contentInput = screen.getByLabelText('본문');
    const submitButton = screen.getByRole('button', { name: '노트 저장' });
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(contentInput, { target: { value: 'Test Content' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith({
        title: '오류',
        description: 'Creation failed',
        variant: 'destructive',
      });
    });
  });

  it('disables submit button when loading', async () => {
    mockCreateNoteAction.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<CreateNoteForm />);
    
    const titleInput = screen.getByLabelText('제목');
    const contentInput = screen.getByLabelText('본문');
    const submitButton = screen.getByRole('button', { name: '노트 저장' });
    
    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(contentInput, { target: { value: 'Test Content' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('저장 중...')).toBeInTheDocument();
    });
  });

  it('calls router.back when cancel button is clicked', () => {
    render(<CreateNoteForm />);
    
    const cancelButton = screen.getByRole('button', { name: '취소' });
    fireEvent.click(cancelButton);
    
    expect(mockRouter.back).toHaveBeenCalled();
  });
});
