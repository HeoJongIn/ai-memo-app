// components/notes/markdown-editor.tsx
// 마크다운 편집기 컴포넌트
// React MDEditor를 사용하여 마크다운 편집과 실시간 미리보기를 제공
// 편집 모드와 미리보기 모드를 지원하며 반응형 디자인 적용

'use client';

import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Eye, Edit3, Save } from 'lucide-react';

interface MarkdownEditorProps {
  title: string;
  content: string;
  onTitleChange: (title: string) => void;
  onContentChange: (content: string) => void;
  onSave?: () => void;
  isSaving?: boolean;
  hasUnsavedChanges?: boolean;
  className?: string;
}

export function MarkdownEditor({
  title,
  content,
  onTitleChange,
  onContentChange,
  onSave,
  isSaving = false,
  hasUnsavedChanges = false,
  className = '',
}: MarkdownEditorProps) {
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview' | 'live'>('live');

  const handleSave = () => {
    if (onSave && hasUnsavedChanges) {
      onSave();
    }
  };

  const getSaveStatus = () => {
    if (isSaving) {
      return { text: '저장 중...', color: 'text-blue-600' };
    }
    if (hasUnsavedChanges) {
      return { text: '저장되지 않은 변경사항', color: 'text-orange-600' };
    }
    return { text: '저장됨', color: 'text-green-600' };
  };

  const saveStatus = getSaveStatus();

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            마크다운 편집기
          </CardTitle>
          <div className="flex items-center gap-4">
            {/* 미리보기 모드 토글 */}
            <div className="flex items-center gap-2">
              <Button
                variant={previewMode === 'edit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('edit')}
                className="flex items-center gap-1"
              >
                <Edit3 className="w-4 h-4" />
                편집
              </Button>
              <Button
                variant={previewMode === 'preview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('preview')}
                className="flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                미리보기
              </Button>
              <Button
                variant={previewMode === 'live' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('live')}
                className="flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                <Edit3 className="w-4 h-4" />
                실시간
              </Button>
            </div>

            {/* 저장 상태 */}
            <div className="flex items-center gap-2 text-sm">
              <div className={`flex items-center gap-1 ${saveStatus.color}`}>
                <div className={`w-2 h-2 rounded-full ${
                  isSaving ? 'bg-blue-500 animate-pulse' : 
                  hasUnsavedChanges ? 'bg-orange-500' : 'bg-green-500'
                }`}></div>
                <span>{saveStatus.text}</span>
              </div>
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
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="노트 제목을 입력하세요"
              className="text-lg font-medium"
              maxLength={255}
            />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {title.length}/255자
            </div>
          </div>

          {/* 마크다운 편집기 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              본문 (마크다운)
            </Label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
              <MDEditor
                value={content}
                onChange={(val) => onContentChange(val || '')}
                preview={previewMode}
                height={400}
                data-color-mode="light"
                visibleDragbar={false}
                textareaProps={{
                  placeholder: '마크다운으로 노트 내용을 작성하세요...',
                  style: {
                    fontSize: 14,
                    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  },
                }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {content.length}자
            </div>
          </div>

          {/* 저장 버튼 */}
          {onSave && (
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className="bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? '저장 중...' : '수동 저장'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
