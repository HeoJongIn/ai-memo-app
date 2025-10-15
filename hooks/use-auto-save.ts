// hooks/use-auto-save.ts
// 자동 저장 훅
// 노트 수정 시 변경사항을 자동으로 저장하는 커스텀 훅
// 5초마다 변경사항을 감지하여 서버에 저장

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/components/ui/toast';

interface UseAutoSaveOptions {
  noteId: string;
  title: string;
  content: string;
  onSave: (noteId: string, title: string, content: string) => Promise<{ success: boolean; error?: string }>;
  interval?: number; // 자동 저장 간격 (밀리초)
  enabled?: boolean; // 자동 저장 활성화 여부
}

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveError: string | null;
}

export function useAutoSave({
  noteId,
  title,
  content,
  onSave,
  interval = 5000, // 5초
  enabled = true,
}: UseAutoSaveOptions) {
  const { addToast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<{ title: string; content: string }>({ title, content });
  const isSavingRef = useRef(false);

  // 변경사항 감지
  const hasChanges = useCallback(() => {
    return (
      title !== lastSavedRef.current.title ||
      content !== lastSavedRef.current.content
    );
  }, [title, content]);

  // 자동 저장 실행
  const performAutoSave = useCallback(async () => {
    if (!enabled || !hasChanges() || isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    
    try {
      const result = await onSave(noteId, title, content);
      
      if (result.success) {
        lastSavedRef.current = { title, content };
      } else {
        addToast({
          title: '자동 저장 실패',
          description: result.error || '변경사항을 저장하는데 실패했습니다.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      addToast({
        title: '자동 저장 오류',
        description: '예상치 못한 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      isSavingRef.current = false;
    }
  }, [noteId, title, content, onSave, enabled, hasChanges, addToast]);

  // 자동 저장 스케줄링
  useEffect(() => {
    if (!enabled || !hasChanges()) {
      return;
    }

    // 기존 타이머 클리어
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 새 타이머 설정
    timeoutRef.current = setTimeout(() => {
      performAutoSave();
    }, interval);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [title, content, interval, enabled, hasChanges, performAutoSave]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // 수동 저장 함수
  const saveNow = useCallback(async () => {
    if (!hasChanges() || isSavingRef.current) {
      return { success: true };
    }

    await performAutoSave();
    return { success: !isSavingRef.current };
  }, [hasChanges, performAutoSave]);

  // 상태 반환
  const state: AutoSaveState = {
    isSaving: isSavingRef.current,
    lastSaved: hasChanges() ? null : new Date(),
    hasUnsavedChanges: hasChanges(),
    saveError: null,
  };

  return {
    ...state,
    saveNow,
  };
}

