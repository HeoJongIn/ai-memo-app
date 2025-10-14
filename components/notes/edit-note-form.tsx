// components/notes/edit-note-form.tsx
// 노트 수정 폼 컴포넌트
// 기존 노트의 제목과 본문을 편집할 수 있는 폼 컴포넌트
// 자동 저장 기능과 실시간 피드백을 포함하여 반응형 디자인 적용

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAutoSave } from '@/hooks/use-auto-save';
import { updateNoteAction } from '@/lib/actions/notes';
import { useToast } from '@/components/ui/toast';
import type { Note } from '@/lib/types/database';

interface EditNoteFormProps {
  note: Note;
  onSave: () => void;
  onChanges: (hasChanges: boolean) => void;
}

export function EditNoteForm({ note, onSave, onChanges }: EditNoteFormProps) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [isManualSaving, setIsManualSaving] = useState(false);
  const { addToast } = useToast();

  // 자동 저장 훅 사용
  const { isSaving, hasUnsavedChanges, saveNow } = useAutoSave({
    noteId: note.id,
    title,
    content,
    onSave: updateNoteAction,
    interval: 5000, // 5초마다 자동 저장
    enabled: true,
  });

  // 변경사항 감지 및 부모 컴포넌트에 알림
  useEffect(() => {
    const hasChanges = title !== note.title || content !== note.content;
    onChanges(hasChanges);
  }, [title, content, note.title, note.content, onChanges]);

  // 수동 저장 함수
  const handleManualSave = async () => {
    setIsManualSaving(true);
    try {
      const result = await saveNow();
      if (result.success) {
        addToast({
          title: '저장 완료',
          description: '노트가 성공적으로 저장되었습니다.',
          variant: 'success',
        });
        onSave();
      }
    } catch {
      addToast({
        title: '저장 실패',
        description: '노트 저장 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsManualSaving(false);
    }
  };

  // 저장 상태 표시
  const getSaveStatus = () => {
    if (isManualSaving) {
      return { text: '저장 중...', color: 'text-blue-600' };
    }
    if (isSaving) {
      return { text: '자동 저장 중...', color: 'text-blue-600' };
    }
    if (hasUnsavedChanges) {
      return { text: '저장되지 않은 변경사항', color: 'text-orange-600' };
    }
    return { text: '저장됨', color: 'text-green-600' };
  };

  const saveStatus = getSaveStatus();

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            노트 수정
          </CardTitle>
          <div className="flex items-center gap-2 text-sm">
            <div className={`flex items-center gap-1 ${saveStatus.color}`}>
              <div className={`w-2 h-2 rounded-full ${
                isSaving || isManualSaving ? 'bg-blue-500 animate-pulse' : 
                hasUnsavedChanges ? 'bg-orange-500' : 'bg-green-500'
              }`}></div>
              <span>{saveStatus.text}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-6">
          {/* 제목 입력 */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              제목
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="노트 제목을 입력하세요"
              className="text-lg font-medium"
              maxLength={255}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {title.length}/255자
            </div>
          </div>

          {/* 본문 입력 */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              본문
            </Label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="노트 내용을 입력하세요"
              className="w-full min-h-[400px] p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
              style={{ fontFamily: 'inherit' }}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {content.length}자
            </div>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end">
            <Button
              onClick={handleManualSave}
              disabled={isSaving || isManualSaving || !hasUnsavedChanges}
              className="bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white"
            >
              {isManualSaving ? '저장 중...' : '수동 저장'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
