// app/notes/page.tsx
// 노트 목록 페이지 컴포넌트
// 사용자가 작성한 모든 노트를 페이지네이션과 함께 표시하는 페이지
// NoteCard 컴포넌트와 Pagination 컴포넌트를 사용하여 구현

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NoteCard } from '@/components/notes/note-card';
import { Pagination } from '@/components/ui/pagination';
import { EmptyNotes } from '@/components/notes/empty-notes';
import { SortDropdown, type SortOption } from '@/components/notes/sort-dropdown';
import { useToast } from '@/components/ui/toast';
import { getNotesAction } from '@/lib/actions/notes';
import { Clock } from 'lucide-react';
import type { Note } from '@/lib/types/database';

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  const currentPage = parseInt(searchParams.get('page') || '1');
  const currentSort = (searchParams.get('sort') as SortOption) || 'latest';

  useEffect(() => {
    loadNotes(currentPage, currentSort);
  }, [currentPage, currentSort]);

  const loadNotes = async (page: number, sortBy: SortOption = 'latest') => {
    setIsLoading(true);
    try {
      const result = await getNotesAction(page, 10, sortBy);
      
      if (result.success) {
        setNotes(result.data.notes);
        setPagination(result.data.pagination);
      } else {
        addToast({
          title: '오류',
          description: result.error || '노트 목록을 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
      }
    } catch {
      addToast({
        title: '오류',
        description: '예상치 못한 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`/notes?${params.toString()}`);
  };

  const handleNoteClick = (noteId: string) => {
    router.push(`/notes/${noteId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              내 노트
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              작성한 노트들을 확인하고 관리하세요.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => router.push('/notes/drafts')}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              임시 저장된 노트
            </Button>
            <Button 
              onClick={() => router.push('/notes/create')}
              className="bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white"
            >
              새 노트 작성
            </Button>
          </div>
        </div>
        
        {/* 정렬 옵션 */}
        <div className="flex items-center justify-between">
          <SortDropdown 
            currentSort={currentSort}
            isLoading={isLoading}
          />
          {pagination && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              총 {pagination.totalCount}개의 노트
            </div>
          )}
        </div>
      </div>

      {!isLoading && notes.length === 0 ? (
        <div className="mt-8">
          <EmptyNotes />
        </div>
      ) : !isLoading ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => handleNoteClick(note.id)}
              />
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </>
      ) : null}
    </div>
  );
}

