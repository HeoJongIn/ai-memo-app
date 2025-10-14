// app/notes/[id]/edit/page.tsx
// 노트 수정 페이지 컴포넌트
// 기존 노트의 내용을 수정할 수 있는 동적 라우트 페이지
// EditNoteForm 컴포넌트를 사용하여 노트 수정 기능 제공

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EditNoteForm } from '@/components/notes/edit-note-form';
import { CancelEditDialog } from '@/components/notes/cancel-edit-dialog';
import { useToast } from '@/components/ui/toast';
import { getNoteAction } from '@/lib/actions/notes';
import type { Note } from '@/lib/types/database';

export default function EditNotePage() {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { addToast } = useToast();

  const noteId = params.id as string;

  useEffect(() => {
    if (noteId) {
      loadNote(noteId);
    }
  }, [noteId]);

  const loadNote = async (id: string) => {
    setIsLoading(true);
    try {
      const result = await getNoteAction(id);
      
      if (result.success) {
        setNote(result.data);
      } else {
        addToast({
          title: '오류',
          description: result.error || '노트를 불러오는데 실패했습니다.',
          variant: 'destructive',
        });
        
        // 에러에 따라 적절한 페이지로 리다이렉트
        if (result.error?.includes('로그인이 필요')) {
          router.push('/auth/login');
        } else if (result.error?.includes('not found') || result.error?.includes('찾을 수 없')) {
          router.push('/notes');
        } else {
          router.push('/notes');
        }
      }
    } catch {
      addToast({
        title: '오류',
        description: '예상치 못한 오류가 발생했습니다.',
        variant: 'destructive',
      });
      router.push('/notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    // 저장 완료 후 상세 페이지로 이동
    router.push(`/notes/${noteId}`);
  };

  const handleCancel = () => {
    if (hasChanges) {
      setCancelDialogOpen(true);
    } else {
      router.push(`/notes/${noteId}`);
    }
  };

  const handleCancelConfirm = () => {
    router.push(`/notes/${noteId}`);
  };

  const handleBack = () => {
    router.push(`/notes/${noteId}`);
  };

  const handleChanges = (hasChanges: boolean) => {
    setHasChanges(hasChanges);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-cyan-400"></div>
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              노트를 찾을 수 없습니다
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              요청하신 노트가 존재하지 않거나 접근 권한이 없습니다.
            </p>
            <Button onClick={handleBack} variant="outline">
              노트 목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <Button 
            onClick={handleBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            ← 노트 상세
          </Button>
          <div className="flex gap-2">
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              취소
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white"
            >
              저장 완료
            </Button>
          </div>
        </div>
      </div>

      <EditNoteForm 
        note={note} 
        onSave={handleSave}
        onChanges={handleChanges}
      />

      <CancelEditDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}

