// components/notes/delete-note-dialog.tsx
// 노트 삭제 확인 다이얼로그 컴포넌트
// 사용자가 노트 삭제를 확인할 수 있는 다이얼로그
// 노트 제목을 표시하여 더 명확한 삭제 확인 제공
// shadcn/ui Dialog 컴포넌트를 사용하여 구현

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { deleteNoteAction } from '@/lib/actions/notes';

interface DeleteNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId: string;
  noteTitle: string;
  onConfirm: () => void;
}

export function DeleteNoteDialog({ 
  open, 
  onOpenChange, 
  noteId, 
  noteTitle,
  onConfirm 
}: DeleteNoteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteNoteAction(noteId);
      
      if (result.success) {
        addToast({
          title: '삭제 완료',
          description: `"${noteTitle}" 노트가 성공적으로 삭제되었습니다.`,
          variant: 'success',
        });
        onOpenChange(false);
        onConfirm();
      } else {
        addToast({
          title: '삭제 실패',
          description: result.error || '노트 삭제에 실패했습니다.',
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
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 dark:text-red-400">
            노트 삭제 확인
          </DialogTitle>
          <DialogDescription>
            다음 노트를 삭제하시겠습니까?
          </DialogDescription>
          <div className="space-y-3 mt-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md">
              <div className="font-medium text-gray-900 dark:text-white">
                "{noteTitle}"
              </div>
            </div>
            <div className="text-red-600 dark:text-red-400 font-medium">
              ⚠️ 이 작업은 되돌릴 수 없습니다.
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                삭제 중...
              </div>
            ) : (
              '삭제'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
