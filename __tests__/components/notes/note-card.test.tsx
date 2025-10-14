// __tests__/components/notes/note-card.test.tsx
// 노트 카드 컴포넌트 테스트
// 노트 카드 렌더링, 클릭 이벤트, 날짜 포맷팅을 테스트
// Jest와 React Testing Library를 사용한 단위 테스트

import { render, screen, fireEvent } from '@testing-library/react';
import { NoteCard } from '@/components/notes/note-card';
import type { Note } from '@/lib/types/database';

const mockNote: Note = {
  id: 'note-1',
  userId: 'user-1',
  title: 'Test Note Title',
  content: 'This is a test note content that should be displayed in the card.',
  createdAt: new Date('2024-12-19T10:00:00Z'),
  updatedAt: new Date('2024-12-19T10:00:00Z'),
};

const mockNoteWithLongContent: Note = {
  id: 'note-2',
  userId: 'user-1',
  title: 'Long Content Note',
  content: 'This is a very long note content that should be truncated when displayed in the card because it exceeds the maximum character limit for preview.',
  createdAt: new Date('2024-12-19T11:00:00Z'),
  updatedAt: new Date('2024-12-19T12:00:00Z'),
};

describe('NoteCard', () => {
  it('renders note information correctly', () => {
    const mockOnClick = jest.fn();
    render(<NoteCard note={mockNote} onClick={mockOnClick} />);
    
    expect(screen.getByText('Test Note Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test note content that should be displayed in the card.')).toBeInTheDocument();
    expect(screen.getByText(/작성일:/)).toBeInTheDocument();
  });

  it('truncates long content with ellipsis', () => {
    const mockOnClick = jest.fn();
    render(<NoteCard note={mockNoteWithLongContent} onClick={mockOnClick} />);
    
    expect(screen.getByText(/This is a very long note content that should be truncated when displayed in the card because it exceeds the maximum character limit for preview\.\.\./)).toBeInTheDocument();
  });

  it('shows modified indicator when updatedAt differs from createdAt', () => {
    const mockOnClick = jest.fn();
    render(<NoteCard note={mockNoteWithLongContent} onClick={mockOnClick} />);
    
    expect(screen.getByText('수정됨')).toBeInTheDocument();
  });

  it('does not show modified indicator when updatedAt equals createdAt', () => {
    const mockOnClick = jest.fn();
    render(<NoteCard note={mockNote} onClick={mockOnClick} />);
    
    expect(screen.queryByText('수정됨')).not.toBeInTheDocument();
  });

  it('calls onClick when card is clicked', () => {
    const mockOnClick = jest.fn();
    render(<NoteCard note={mockNote} onClick={mockOnClick} />);
    
    fireEvent.click(screen.getByRole('generic'));
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('formats date correctly', () => {
    const mockOnClick = jest.fn();
    render(<NoteCard note={mockNote} onClick={mockOnClick} />);
    
    // 한국어 날짜 포맷 확인
    expect(screen.getByText(/2024년 12월 19일/)).toBeInTheDocument();
  });

  it('applies hover styles', () => {
    const mockOnClick = jest.fn();
    const { container } = render(<NoteCard note={mockNote} onClick={mockOnClick} />);
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('cursor-pointer', 'hover:shadow-lg', 'hover:scale-[1.02]');
  });
});

