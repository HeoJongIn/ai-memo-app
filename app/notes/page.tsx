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
import { DeleteAllNotesDialog } from '@/components/notes/delete-all-notes-dialog';
import { useToast } from '@/components/ui/toast';
import { getNotesAction } from '@/lib/actions/notes';
import { Clock, Home, Trash2 } from 'lucide-react';
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
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
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

  const handleDeleteAllSuccess = () => {
    // 노트 목록 새로고침
    loadNotes(currentPage, currentSort);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* 실제 오로라 배경 */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 opacity-15"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 via-purple-600 to-fuchsia-700 opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-bl from-rose-400 via-pink-500 to-red-600 opacity-18"></div>
        
        {/* 움직이는 오로라 효과 - 역동적이고 생동감 있는 움직임 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-0 left-1/3 w-[200px] h-[120vh] bg-gradient-to-b from-emerald-400/60 via-teal-500/50 to-transparent animate-aurora-dance-1 filter blur-xl"></div>
          <div className="absolute top-0 left-1/2 w-[250px] h-[120vh] bg-gradient-to-b from-violet-500/55 via-purple-600/45 to-transparent animate-aurora-dance-2 filter blur-xl" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-0 right-1/3 w-[200px] h-[120vh] bg-gradient-to-b from-blue-400/50 via-indigo-500/40 to-transparent animate-aurora-dance-3 filter blur-xl" style={{animationDelay: '4s'}}></div>
          <div className="absolute top-1/3 left-0 w-full h-[100px] bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent animate-aurora-horizontal-flow filter blur-lg"></div>
        </div>
        
        <div className="relative z-10 text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700 font-medium">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 실제 오로라 배경 - 더 자연스러운 색상과 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 opacity-15"></div>
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 via-purple-600 to-fuchsia-700 opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-bl from-rose-400 via-pink-500 to-red-600 opacity-18"></div>
      <div className="absolute inset-0 bg-gradient-to-tl from-blue-400 via-indigo-500 to-purple-700 opacity-12"></div>
      
      {/* 움직이는 오로라 효과 - 역동적이고 생동감 있는 움직임 */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        {/* 첫 번째 움직이는 오로라 - 초록-청록 계열 */}
        <div className="absolute top-0 left-1/4 w-[300px] h-[120vh] bg-gradient-to-b from-emerald-400/70 via-teal-500/60 to-transparent animate-aurora-dance-1 filter blur-2xl"></div>
        
        {/* 두 번째 움직이는 오로라 - 보라-핑크 계열 */}
        <div className="absolute top-0 left-1/2 w-[400px] h-[120vh] bg-gradient-to-b from-violet-500/65 via-purple-600/55 to-transparent animate-aurora-dance-2 filter blur-2xl" style={{animationDelay: '3s'}}></div>
        
        {/* 세 번째 움직이는 오로라 - 파랑-보라 계열 */}
        <div className="absolute top-0 right-1/4 w-[350px] h-[120vh] bg-gradient-to-b from-blue-400/60 via-indigo-500/50 to-transparent animate-aurora-dance-3 filter blur-2xl" style={{animationDelay: '6s'}}></div>
        
        {/* 네 번째 움직이는 오로라 - 핑크-빨강 계열 */}
        <div className="absolute top-0 left-0 w-[250px] h-[120vh] bg-gradient-to-b from-rose-400/55 via-pink-500/45 to-transparent animate-aurora-dance-4 filter blur-2xl" style={{animationDelay: '9s'}}></div>
        
        {/* 수평 흐름 오로라 */}
        <div className="absolute top-1/3 left-0 w-full h-[200px] bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent animate-aurora-horizontal-flow filter blur-xl"></div>
        <div className="absolute top-2/3 left-0 w-full h-[150px] bg-gradient-to-r from-transparent via-purple-300/45 to-transparent animate-aurora-horizontal-flow filter blur-xl" style={{animationDelay: '6s'}}></div>
        
        {/* 강렬한 오로라 빛의 깜빡임 */}
        <div className="absolute top-1/5 left-1/3 w-[200px] h-[200px] bg-gradient-radial from-emerald-300/80 via-transparent to-transparent rounded-full animate-aurora-bright-flicker filter blur-lg"></div>
        <div className="absolute top-1/2 right-1/3 w-[180px] h-[180px] bg-gradient-radial from-violet-300/75 via-transparent to-transparent rounded-full animate-aurora-bright-flicker filter blur-lg" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/2 w-[160px] h-[160px] bg-gradient-radial from-cyan-300/70 via-transparent to-transparent rounded-full animate-aurora-bright-flicker filter blur-lg" style={{animationDelay: '4s'}}></div>
        
        {/* 오로라 빛의 파동 효과 */}
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-gradient-radial from-emerald-200/60 via-transparent to-transparent rounded-full animate-aurora-pulse filter blur-2xl"></div>
        <div className="absolute top-3/4 right-1/4 w-[250px] h-[250px] bg-gradient-radial from-violet-200/55 via-transparent to-transparent rounded-full animate-aurora-pulse filter blur-2xl" style={{animationDelay: '3s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-[200px] h-[200px] bg-gradient-radial from-cyan-200/50 via-transparent to-transparent rounded-full animate-aurora-pulse filter blur-2xl" style={{animationDelay: '6s'}}></div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-violet-500 to-cyan-400 bg-clip-text text-transparent mb-6 animate-pulse">
              내 노트
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              작성한 노트들을 확인하고 관리하세요.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => router.push('/')}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              메인화면
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/notes/drafts')}
              className="flex items-center gap-2"
            >
              <Clock className="w-4 h-4" />
              임시 저장된 노트
            </Button>
            {notes.length > 0 && (
              <Button 
                variant="outline"
                onClick={() => setDeleteAllDialogOpen(true)}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
                모든 노트 삭제
              </Button>
            )}
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
      
      {/* 모든 노트 삭제 다이얼로그 */}
      <DeleteAllNotesDialog
        open={deleteAllDialogOpen}
        onOpenChange={setDeleteAllDialogOpen}
        onSuccess={handleDeleteAllSuccess}
        noteCount={pagination?.totalCount || notes.length}
      />
    </div>
  );
}

