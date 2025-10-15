// __tests__/components/notes/note-summary.test.tsx
// NoteSummary 컴포넌트 테스트
// 요약 생성 UI 컴포넌트의 기능과 사용자 인터랙션 테스트
// 로딩 상태, 에러 핸들링, 요약 표시 기능 검증

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NoteSummary } from '@/components/notes/note-summary';
import { generateSummaryAction } from '@/lib/actions/ai';
import type { Summary } from '@/lib/types/database';

// Mock the AI action
jest.mock('@/lib/actions/ai', () => ({
  generateSummaryAction: jest.fn(),
}));

// Mock the toast hook
jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    addToast: jest.fn(),
  }),
}));

const mockGenerateSummaryAction = generateSummaryAction as jest.MockedFunction<typeof generateSummaryAction>;

describe('NoteSummary', () => {
  const mockNoteId = 'test-note-id';
  const mockOnSummaryGenerated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders summary generation button when no summary exists', () => {
    render(
      <NoteSummary 
        noteId={mockNoteId} 
        existingSummary={null}
        onSummaryGenerated={mockOnSummaryGenerated}
      />
    );

    expect(screen.getByText('AI 요약 생성')).toBeInTheDocument();
    expect(screen.getByText('AI 요약이 아직 생성되지 않았습니다. 버튼을 클릭하여 요약을 생성해보세요.')).toBeInTheDocument();
  });

  it('renders existing summary when provided', () => {
    const mockSummary: Summary = {
      noteId: mockNoteId,
      model: 'gemini-2.0-flash-001',
      content: '• 첫 번째 요약 포인트\n• 두 번째 요약 포인트\n• 세 번째 요약 포인트',
      createdAt: new Date('2024-01-01T00:00:00Z'),
    };

    render(
      <NoteSummary 
        noteId={mockNoteId} 
        existingSummary={mockSummary}
        onSummaryGenerated={mockOnSummaryGenerated}
      />
    );

    expect(screen.getByText('AI 요약')).toBeInTheDocument();
    expect(screen.getByText('첫 번째 요약 포인트')).toBeInTheDocument();
    expect(screen.getByText('두 번째 요약 포인트')).toBeInTheDocument();
    expect(screen.getByText('세 번째 요약 포인트')).toBeInTheDocument();
    expect(screen.getByText('요약 재생성')).toBeInTheDocument();
  });

  it('shows loading state when generating summary', async () => {
    mockGenerateSummaryAction.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true, data: { summary: 'Test summary' } }), 100))
    );

    render(
      <NoteSummary 
        noteId={mockNoteId} 
        existingSummary={null}
        onSummaryGenerated={mockOnSummaryGenerated}
      />
    );

    const generateButton = screen.getByText('AI 요약 생성');
    fireEvent.click(generateButton);

    expect(screen.getByText('생성 중...')).toBeInTheDocument();
    expect(generateButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText('생성 중...')).not.toBeInTheDocument();
    });
  });

  it('handles successful summary generation', async () => {
    const mockSummary = '• 첫 번째 요약\n• 두 번째 요약';
    mockGenerateSummaryAction.mockResolvedValue({
      success: true,
      data: { summary: mockSummary }
    });

    render(
      <NoteSummary 
        noteId={mockNoteId} 
        existingSummary={null}
        onSummaryGenerated={mockOnSummaryGenerated}
      />
    );

    const generateButton = screen.getByText('AI 요약 생성');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('첫 번째 요약')).toBeInTheDocument();
      expect(screen.getByText('두 번째 요약')).toBeInTheDocument();
    });

    expect(mockOnSummaryGenerated).toHaveBeenCalledWith(mockSummary);
  });

  it('handles summary generation error', async () => {
    mockGenerateSummaryAction.mockResolvedValue({
      success: false,
      error: 'API 호출 실패'
    });

    render(
      <NoteSummary 
        noteId={mockNoteId} 
        existingSummary={null}
        onSummaryGenerated={mockOnSummaryGenerated}
      />
    );

    const generateButton = screen.getByText('AI 요약 생성');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('AI 요약 생성')).toBeInTheDocument();
    });

    expect(mockOnSummaryGenerated).not.toHaveBeenCalled();
  });

  it('handles unexpected error during summary generation', async () => {
    mockGenerateSummaryAction.mockRejectedValue(new Error('Unexpected error'));

    render(
      <NoteSummary 
        noteId={mockNoteId} 
        existingSummary={null}
        onSummaryGenerated={mockOnSummaryGenerated}
      />
    );

    const generateButton = screen.getByText('AI 요약 생성');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('AI 요약 생성')).toBeInTheDocument();
    });

    expect(mockOnSummaryGenerated).not.toHaveBeenCalled();
  });

  it('parses summary content correctly into bullet points', () => {
    const mockSummary: Summary = {
      noteId: mockNoteId,
      model: 'gemini-2.0-flash-001',
      content: '• 첫 번째 포인트\n- 두 번째 포인트\n1. 세 번째 포인트\n\n네 번째 포인트',
      createdAt: new Date('2024-01-01T00:00:00Z'),
    };

    render(
      <NoteSummary 
        noteId={mockNoteId} 
        existingSummary={mockSummary}
        onSummaryGenerated={mockOnSummaryGenerated}
      />
    );

    expect(screen.getByText('첫 번째 포인트')).toBeInTheDocument();
    expect(screen.getByText('두 번째 포인트')).toBeInTheDocument();
    expect(screen.getByText('세 번째 포인트')).toBeInTheDocument();
    expect(screen.getByText('네 번째 포인트')).toBeInTheDocument();
  });

  it('shows regeneration button for existing summary', () => {
    const mockSummary: Summary = {
      noteId: mockNoteId,
      model: 'gemini-2.0-flash-001',
      content: 'Test summary',
      createdAt: new Date('2024-01-01T00:00:00Z'),
    };

    render(
      <NoteSummary 
        noteId={mockNoteId} 
        existingSummary={mockSummary}
        onSummaryGenerated={mockOnSummaryGenerated}
      />
    );

    expect(screen.getByText('요약 재생성')).toBeInTheDocument();
    expect(screen.getByText(/생성일:/)).toBeInTheDocument();
  });

  it('calls generateSummaryAction with correct noteId', async () => {
    mockGenerateSummaryAction.mockResolvedValue({
      success: true,
      data: { summary: 'Test summary' }
    });

    render(
      <NoteSummary 
        noteId={mockNoteId} 
        existingSummary={null}
        onSummaryGenerated={mockOnSummaryGenerated}
      />
    );

    const generateButton = screen.getByText('AI 요약 생성');
    fireEvent.click(generateButton);

    await waitFor(() => {
      expect(mockGenerateSummaryAction).toHaveBeenCalledWith(mockNoteId);
    });
  });

  it('handles summary regeneration successfully', async () => {
    const mockSummary: Summary = {
      noteId: mockNoteId,
      model: 'gemini-2.0-flash-001',
      content: 'Original summary',
      createdAt: new Date('2024-01-01T00:00:00Z'),
    };

    const newSummary = '• 새로운 요약 포인트 1\n• 새로운 요약 포인트 2';
    mockGenerateSummaryAction.mockResolvedValue({
      success: true,
      data: { summary: newSummary }
    });

    render(
      <NoteSummary 
        noteId={mockNoteId} 
        existingSummary={mockSummary}
        onSummaryGenerated={mockOnSummaryGenerated}
      />
    );

    const regenerateButton = screen.getByText('요약 재생성');
    fireEvent.click(regenerateButton);

    await waitFor(() => {
      expect(screen.getByText('새로운 요약 포인트 1')).toBeInTheDocument();
      expect(screen.getByText('새로운 요약 포인트 2')).toBeInTheDocument();
    });

    expect(mockOnSummaryGenerated).toHaveBeenCalledWith(newSummary);
  });

  it('shows loading state during regeneration', async () => {
    const mockSummary: Summary = {
      noteId: mockNoteId,
      model: 'gemini-2.0-flash-001',
      content: 'Original summary',
      createdAt: new Date('2024-01-01T00:00:00Z'),
    };

    mockGenerateSummaryAction.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ success: true, data: { summary: 'New summary' } }), 100))
    );

    render(
      <NoteSummary 
        noteId={mockNoteId} 
        existingSummary={mockSummary}
        onSummaryGenerated={mockOnSummaryGenerated}
      />
    );

    const regenerateButton = screen.getByText('요약 재생성');
    fireEvent.click(regenerateButton);

    expect(screen.getByText('재생성 중...')).toBeInTheDocument();
    expect(regenerateButton).toBeDisabled();

    await waitFor(() => {
      expect(screen.queryByText('재생성 중...')).not.toBeInTheDocument();
    });
  });

  it('handles regeneration error gracefully', async () => {
    const mockSummary: Summary = {
      noteId: mockNoteId,
      model: 'gemini-2.0-flash-001',
      content: 'Original summary',
      createdAt: new Date('2024-01-01T00:00:00Z'),
    };

    mockGenerateSummaryAction.mockResolvedValue({
      success: false,
      error: '재생성 실패'
    });

    render(
      <NoteSummary 
        noteId={mockNoteId} 
        existingSummary={mockSummary}
        onSummaryGenerated={mockOnSummaryGenerated}
      />
    );

    const regenerateButton = screen.getByText('요약 재생성');
    fireEvent.click(regenerateButton);

    await waitFor(() => {
      expect(screen.getByText('요약 재생성')).toBeInTheDocument();
    });

    // 기존 요약이 유지되어야 함
    expect(screen.getByText('Original summary')).toBeInTheDocument();
    expect(mockOnSummaryGenerated).not.toHaveBeenCalled();
  });
});
