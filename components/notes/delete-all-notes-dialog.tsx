// components/notes/delete-all-notes-dialog.tsx
// 모든 노트를 삭제하기 전에 사용자에게 확인을 요청하는 다이얼로그 컴포넌트
// 삭제 작업의 위험성을 명확히 알리고 최종 확인을 받음

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { deleteAllNotesAction } from '@/lib/actions/notes';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';

interface DeleteAllNotesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  noteCount: number;
}

export function DeleteAllNotesDialog({
  open,
  onOpenChange,
  onSuccess,
  noteCount,
}: DeleteAllNotesDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToast();
  const router = useRouter();

  const handleDeleteAll = async () => {
    setIsDeleting(true);
    const result = await deleteAllNotesAction();
    setIsDeleting(false);

    if (result.success) {
      addToast({
        variant: 'default',
        title: '모든 노트 삭제 완료',
        description: `${result.data?.deletedCount}개의 노트가 성공적으로 삭제되었습니다.`,
      });
      onSuccess();
      onOpenChange(false);
      router.push('/notes'); // 노트 목록 페이지로 이동 또는 새로고침
    } else {
      addToast({
        variant: 'destructive',
        title: '노트 삭제 실패',
        description: result.error || '모든 노트를 삭제하는 중 오류가 발생했습니다.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            모든 노트 삭제
          </DialogTitle>
          <div className="text-muted-foreground text-sm space-y-3">
            <div>
              정말로 <strong>모든 노트({noteCount}개)</strong>를 삭제하시겠습니까?
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-red-800 dark:text-red-200">
                  <div className="font-medium mb-1">⚠️ 이 작업은 되돌릴 수 없습니다!</div>
                  <div className="space-y-1 text-xs">
                    <div>• 모든 노트와 내용이 영구적으로 삭제됩니다</div>
                    <div>• 관련된 태그와 요약도 함께 삭제됩니다</div>
                    <div>• 삭제된 데이터는 복구할 수 없습니다</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            취소
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteAll}
            disabled={isDeleting || noteCount === 0}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                모든 노트 삭제
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

