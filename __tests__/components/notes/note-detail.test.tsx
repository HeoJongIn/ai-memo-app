// __tests__/components/notes/note-detail.test.tsx
// 노트 상세 컴포넌트 테스트
// 노트 상세 정보 표시, 날짜 포맷팅, 수정 표시를 테스트
// Jest와 React Testing Library를 사용한 단위 테스트

import { render, screen } from '@testing-library/react';
import { NoteDetail } from '@/components/notes/note-detail';
import type { Note } from '@/lib/types/database';

const mockNote: Note = {
  id: 'note-1',
  userId: 'user-1',
  title: 'Test Note Title',
  content: 'This is a test note content.\nWith multiple lines.',
  createdAt: new Date('2024-12-19T10:00:00Z'),
  updatedAt: new Date('2024-12-19T10:00:00Z'),
};

const mockModifiedNote: Note = {
  id: 'note-2',
  userId: 'user-1',
  title: 'Modified Note Title',
  content: 'This note has been modified.\nUpdated content here.',
  createdAt: new Date('2024-12-19T10:00:00Z'),
  updatedAt: new Date('2024-12-19T12:00:00Z'),
};

describe('NoteDetail', () => {
  it('renders note information correctly', () => {
    render(<NoteDetail note={mockNote} />);
    
    expect(screen.getByText('Test Note Title')).toBeInTheDocument();
    expect(screen.getByText(/This is a test note content/)).toBeInTheDocument();
    expect(screen.getByText(/작성일:/)).toBeInTheDocument();
  });

  it('shows modified date when note is modified', () => {
    render(<NoteDetail note={mockModifiedNote} />);
    
    expect(screen.getByText('Modified Note Title')).toBeInTheDocument();
    expect(screen.getByText(/수정일:/)).toBeInTheDocument();
  });

  it('does not show modified date when note is not modified', () => {
    render(<NoteDetail note={mockNote} />);
    
    expect(screen.queryByText(/수정일:/)).not.toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<NoteDetail note={mockNote} />);
    
    // 한국어 날짜 포맷 확인
    expect(screen.getByText(/2024년 12월 19일/)).toBeInTheDocument();
  });

  it('preserves line breaks in content', () => {
    render(<NoteDetail note={mockNote} />);
    
    const contentElement = screen.getByText(/This is a test note content/);
    expect(contentElement).toBeInTheDocument();
  });

  it('applies correct styling classes', () => {
    const { container } = render(<NoteDetail note={mockNote} />);
    
    const card = container.querySelector('[data-slot="card"]');
    expect(card).toHaveClass('w-full');
    
    const title = screen.getByText('Test Note Title');
    expect(title).toHaveClass('text-2xl', 'font-bold', 'break-words');
  });

  it('handles long titles with word break', () => {
    const longTitleNote: Note = {
      ...mockNote,
      title: 'This is a very long title that should break properly when displayed in the note detail component',
    };
    
    render(<NoteDetail note={longTitleNote} />);
    
    const title = screen.getByText(longTitleNote.title);
    expect(title).toHaveClass('break-words');
  });
});
