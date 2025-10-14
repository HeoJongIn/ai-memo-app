// components/notes/note-card.tsx
// 노트 카드 컴포넌트
// 개별 노트를 카드 형태로 표시하는 컴포넌트
// 제목, 본문 미리보기, 생성일시를 포함하여 반응형 디자인 적용

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Note } from '@/lib/types/database';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
}

export function NoteCard({ note, onClick }: NoteCardProps) {
  // 본문 미리보기 생성 (최대 150자)
  const getPreview = (content: string) => {
    if (content.length <= 150) {
      return content;
    }
    return content.substring(0, 150) + '...';
  };

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-[1.02] transform transition-transform"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
          {note.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-4 mb-4">
          {getPreview(note.content)}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
          <span>작성일: {formatDate(note.createdAt)}</span>
          {note.updatedAt.getTime() !== note.createdAt.getTime() && (
            <span className="text-blue-600 dark:text-blue-400">수정됨</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

