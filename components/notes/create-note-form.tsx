// components/notes/create-note-form.tsx
// 노트 생성 폼 컴포넌트
// 사용자가 제목과 본문을 입력하여 새로운 노트를 생성할 수 있는 폼
// shadcn/ui 컴포넌트를 사용하여 반응형 디자인 구현

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { createNoteAction } from '@/lib/actions/notes';
import { DraftSaveButton } from './draft-save-button';

export function CreateNoteForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      addToast({
        title: '입력 오류',
        description: '제목과 본문을 모두 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await createNoteAction(title.trim(), content.trim());
      
      if (result.success) {
        addToast({
          title: '성공',
          description: '노트가 성공적으로 생성되었습니다.',
          variant: 'success',
        });
        
        // 성공 시 노트 목록 페이지로 이동
        setTimeout(() => {
          router.push('/notes');
        }, 1000);
      } else {
        addToast({
          title: '오류',
          description: result.error || '노트 생성에 실패했습니다.',
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>노트 작성</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              type="text"
              placeholder="노트 제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              className="w-full"
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">본문</Label>
            <textarea
              id="content"
              placeholder="노트 내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
              className="w-full min-h-[300px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              rows={12}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading || !title.trim() || !content.trim()}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white"
            >
              {isLoading ? '저장 중...' : '노트 저장'}
            </Button>
            <DraftSaveButton
              title={title}
              content={content}
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              취소
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
