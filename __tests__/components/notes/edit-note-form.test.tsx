// __tests__/components/notes/edit-note-form.test.tsx
// 노트 수정 폼 컴포넌트 테스트
// 폼 렌더링, 입력 업데이트, 자동 저장 기능을 테스트
// Jest와 React Testing Library를 사용한 단위 테스트

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditNoteForm } from '@/components/notes/edit-note-form';
import type { Note } from '@/lib/types/database';

// Mock 설정
jest.mock('@/hooks/use-auto-save', () => ({
  useAutoSave: jest.fn(),
}));

jest.mock('@/lib/actions/notes', () => ({
  updateNoteAction: jest.fn(),
}));

jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    addToast: jest.fn(),
  }),
}));

const mockUseAutoSave = require('@/hooks/use-auto-save').useAutoSave;
const mockUpdateNoteAction = require('@/lib/actions/notes').updateNoteAction;

const mockNote: Note = {
  id: 'note-1',
  userId: 'user-1',
  title: 'Original Title',
  content: 'Original content here.',
  createdAt: new Date('2024-12-19T10:00:00Z'),
  updatedAt: new Date('2024-12-19T10:00:00Z'),
};

describe('EditNoteForm', () => {
  const mockOnSave = jest.fn();
  const mockOnChanges = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAutoSave.mockReturnValue({
      isSaving: false,
      hasUnsavedChanges: false,
      saveNow: jest.fn().mockResolvedValue({ success: true }),
    });
  });

  it('renders form with initial note data', () => {
    render(
      <EditNoteForm 
        note={mockNote} 
        onSave={mockOnSave}
        onChanges={mockOnChanges}
      />
    );
    
    expect(screen.getByDisplayValue('Original Title')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Original content here.')).toBeInTheDocument();
    expect(screen.getByText('노트 수정')).toBeInTheDocument();
  });

  it('updates title when input changes', () => {
    render(
      <EditNoteForm 
        note={mockNote} 
        onSave={mockOnSave}
        onChanges={mockOnChanges}
      />
    );
    
    const titleInput = screen.getByDisplayValue('Original Title');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    
    expect(titleInput).toHaveValue('Updated Title');
  });

  it('updates content when textarea changes', () => {
    render(
      <EditNoteForm 
        note={mockNote} 
        onSave={mockOnSave}
        onChanges={mockOnChanges}
      />
    );
    
    const contentTextarea = screen.getByDisplayValue('Original content here.');
    fireEvent.change(contentTextarea, { target: { value: 'Updated content here.' } });
    
    expect(contentTextarea).toHaveValue('Updated content here.');
  });

  it('shows character count for title', () => {
    render(
      <EditNoteForm 
        note={mockNote} 
        onSave={mockOnSave}
        onChanges={mockOnChanges}
      />
    );
    
    expect(screen.getByText(/14\/255자/)).toBeInTheDocument();
  });

  it('shows character count for content', () => {
    render(
      <EditNoteForm 
        note={mockNote} 
        onSave={mockOnSave}
        onChanges={mockOnChanges}
      />
    );
    
    expect(screen.getByText('22자')).toBeInTheDocument();
  });

  it('shows save status when saving', () => {
    mockUseAutoSave.mockReturnValue({
      isSaving: true,
      hasUnsavedChanges: true,
      saveNow: jest.fn().mockResolvedValue({ success: true }),
    });

    render(
      <EditNoteForm 
        note={mockNote} 
        onSave={mockOnSave}
        onChanges={mockOnChanges}
      />
    );
    
    expect(screen.getByText('자동 저장 중...')).toBeInTheDocument();
  });

  it('shows unsaved changes status', () => {
    mockUseAutoSave.mockReturnValue({
      isSaving: false,
      hasUnsavedChanges: true,
      saveNow: jest.fn().mockResolvedValue({ success: true }),
    });

    render(
      <EditNoteForm 
        note={mockNote} 
        onSave={mockOnSave}
        onChanges={mockOnChanges}
      />
    );
    
    expect(screen.getByText('저장되지 않은 변경사항')).toBeInTheDocument();
  });

  it('shows saved status when no changes', () => {
    mockUseAutoSave.mockReturnValue({
      isSaving: false,
      hasUnsavedChanges: false,
      saveNow: jest.fn().mockResolvedValue({ success: true }),
    });

    render(
      <EditNoteForm 
        note={mockNote} 
        onSave={mockOnSave}
        onChanges={mockOnChanges}
      />
    );
    
    expect(screen.getByText('저장됨')).toBeInTheDocument();
  });

  it('calls onChanges when form data changes', () => {
    render(
      <EditNoteForm 
        note={mockNote} 
        onSave={mockOnSave}
        onChanges={mockOnChanges}
      />
    );
    
    const titleInput = screen.getByDisplayValue('Original Title');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    
    expect(mockOnChanges).toHaveBeenCalledWith(true);
  });

  it('disables manual save button when saving', () => {
    mockUseAutoSave.mockReturnValue({
      isSaving: true,
      hasUnsavedChanges: true,
      saveNow: jest.fn().mockResolvedValue({ success: true }),
    });

    render(
      <EditNoteForm 
        note={mockNote} 
        onSave={mockOnSave}
        onChanges={mockOnChanges}
      />
    );
    
    const saveButton = screen.getByText('수동 저장');
    expect(saveButton).toBeDisabled();
  });

  it('enables manual save button when has changes', () => {
    mockUseAutoSave.mockReturnValue({
      isSaving: false,
      hasUnsavedChanges: true,
      saveNow: jest.fn().mockResolvedValue({ success: true }),
    });

    render(
      <EditNoteForm 
        note={mockNote} 
        onSave={mockOnSave}
        onChanges={mockOnChanges}
      />
    );
    
    const saveButton = screen.getByText('수동 저장');
    expect(saveButton).not.toBeDisabled();
  });

  it('calls saveNow when manual save button is clicked', async () => {
    const mockSaveNow = jest.fn().mockResolvedValue({ success: true });
    mockUseAutoSave.mockReturnValue({
      isSaving: false,
      hasUnsavedChanges: true,
      saveNow: mockSaveNow,
    });

    render(
      <EditNoteForm 
        note={mockNote} 
        onSave={mockOnSave}
        onChanges={mockOnChanges}
      />
    );
    
    const saveButton = screen.getByText('수동 저장');
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(mockSaveNow).toHaveBeenCalled();
    });
  });

  it('enforces title character limit', () => {
    render(
      <EditNoteForm 
        note={mockNote} 
        onSave={mockOnSave}
        onChanges={mockOnChanges}
      />
    );
    
    const titleInput = screen.getByDisplayValue('Original Title');
    expect(titleInput).toHaveAttribute('maxLength', '255');
  });
});
