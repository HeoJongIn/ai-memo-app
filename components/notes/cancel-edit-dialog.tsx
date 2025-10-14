// components/notes/cancel-edit-dialog.tsx
// 노트 수정 취소 확인 다이얼로그 컴포넌트
// 사용자가 수정을 취소할 때 변경사항 손실을 확인하는 다이얼로그
// shadcn/ui Dialog 컴포넌트를 사용하여 구현

'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CancelEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function CancelEditDialog({ 
  open, 
  onOpenChange, 
  onConfirm 
}: CancelEditDialogProps) {
  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onOpenChange(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-orange-600 dark:text-orange-400">
            수정 취소 확인
          </DialogTitle>
          <DialogDescription>
            저장되지 않은 변경사항이 있습니다. 정말로 수정을 취소하시겠습니까?
            <br />
            <span className="text-red-600 dark:text-red-400 font-medium">
              취소하면 변경사항이 모두 사라집니다.
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            계속 수정
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            취소하고 나가기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

