// components/notes/note-detail.tsx
// 노트 상세 컴포넌트
// 개별 노트의 전체 내용을 표시하는 컴포넌트
// 제목, 본문, 생성일시, 수정일시를 포함하여 반응형 디자인 적용

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Note } from '@/lib/types/database';

interface NoteDetailProps {
  note: Note;
}

export function NoteDetail({ note }: NoteDetailProps) {
  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  // 수정 여부 확인
  const isModified = note.updatedAt.getTime() !== note.createdAt.getTime();

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white break-words">
          {note.title}
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
          <span>작성일: {formatDate(note.createdAt)}</span>
          {isModified && (
            <span className="text-blue-600 dark:text-blue-400">
              수정일: {formatDate(note.updatedAt)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
            {note.content}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

