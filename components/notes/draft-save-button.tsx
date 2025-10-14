// components/notes/draft-save-button.tsx
// 임시 저장 버튼 컴포넌트
// 노트 작성 중 임시 저장 기능을 제공하는 버튼
// 실시간 자동 저장과 구분되는 명시적 임시 저장 기능

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { saveDraftAction } from '@/lib/actions/notes';
import { Save, Check } from 'lucide-react';

interface DraftSaveButtonProps {
  title: string;
  content: string;
  disabled?: boolean;
  className?: string;
}

export function DraftSaveButton({ 
  title, 
  content, 
  disabled = false,
  className = ''
}: DraftSaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { addToast } = useToast();

  const handleSaveDraft = async () => {
    if (!title.trim() && !content.trim()) {
      addToast({
        title: '알림',
        description: '제목 또는 내용을 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    setIsSaved(false);

    try {
      const result = await saveDraftAction(title, content);
      
      if (result.success) {
        setIsSaved(true);
        addToast({
          title: '성공',
          description: '임시 저장되었습니다. 7일 후 자동으로 삭제됩니다.',
          variant: 'default',
        });
        
        // 2초 후 저장 상태 해제
        setTimeout(() => setIsSaved(false), 2000);
      } else {
        addToast({
          title: '오류',
          description: result.error || '임시 저장 중 오류가 발생했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      addToast({
        title: '오류',
        description: '예상치 못한 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      onClick={handleSaveDraft}
      disabled={disabled || isSaving}
      variant="outline"
      className={`flex items-center gap-2 ${className}`}
      aria-label="임시 저장"
    >
      {isSaving ? (
        <>
          <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          <span>저장 중...</span>
        </>
      ) : isSaved ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span>저장됨</span>
        </>
      ) : (
        <>
          <Save className="w-4 h-4" />
          <span>임시 저장</span>
        </>
      )}
    </Button>
  );
}
