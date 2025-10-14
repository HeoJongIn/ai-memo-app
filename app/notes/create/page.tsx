// app/notes/create/page.tsx
// 노트 생성 페이지 컴포넌트
// 사용자가 새로운 노트를 생성할 수 있는 페이지를 제공
// CreateNoteForm 컴포넌트를 사용하여 노트 생성 기능 구현

import { CreateNoteForm } from '@/components/notes/create-note-form';

export default function CreateNotePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          새 노트 작성
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          아이디어와 정보를 체계적으로 기록해보세요.
        </p>
      </div>
      
      <CreateNoteForm />
    </div>
  );
}

