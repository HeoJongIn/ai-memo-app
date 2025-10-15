// components/notes/markdown-renderer.tsx
// 마크다운 렌더링 컴포넌트
// react-markdown을 사용하여 마크다운 텍스트를 HTML로 렌더링
// 코드 하이라이팅과 GitHub Flavored Markdown 지원

'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Edit3 } from 'lucide-react';
import { useState } from 'react';

interface MarkdownRendererProps {
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  onEdit?: () => void;
  className?: string;
}

export function MarkdownRenderer({
  title,
  content,
  createdAt,
  updatedAt,
  onEdit,
  className = '',
}: MarkdownRendererProps) {
  const [showRawMarkdown, setShowRawMarkdown] = useState(false);

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  // 수정 여부 확인
  const isModified = updatedAt.getTime() !== createdAt.getTime();

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white break-words">
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* 원본 마크다운 토글 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRawMarkdown(!showRawMarkdown)}
              className="flex items-center gap-1"
            >
              <Eye className="w-4 h-4" />
              {showRawMarkdown ? '렌더링 보기' : '원본 보기'}
            </Button>
            
            {/* 편집 버튼 */}
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="flex items-center gap-1 border-blue-300 text-blue-700 hover:bg-blue-50"
              >
                <Edit3 className="w-4 h-4" />
                편집
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mt-2">
          <span>작성일: {formatDate(createdAt)}</span>
          {isModified && (
            <span className="text-blue-600 dark:text-blue-400">
              수정일: {formatDate(updatedAt)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {showRawMarkdown ? (
          // 원본 마크다운 텍스트 표시
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 font-mono">
              {content}
            </pre>
          </div>
        ) : (
          // 렌더링된 마크다운 표시
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // 코드 블록 스타일링
                code: ({ node, inline, className, children, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 my-4">
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-mono">
                        {match[1]}
                      </div>
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </div>
                  ) : (
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                      {children}
                    </code>
                  );
                },
                // 링크 스타일링
                a: ({ href, children, ...props }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    {...props}
                  >
                    {children}
                  </a>
                ),
                // 테이블 스타일링
                table: ({ children, ...props }) => (
                  <div className="overflow-x-auto my-4">
                    <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600" {...props}>
                      {children}
                    </table>
                  </div>
                ),
                th: ({ children, ...props }) => (
                  <th className="border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-2 text-left font-semibold" {...props}>
                    {children}
                  </th>
                ),
                td: ({ children, ...props }) => (
                  <td className="border border-gray-300 dark:border-gray-600 px-4 py-2" {...props}>
                    {children}
                  </td>
                ),
                // 인용구 스타일링
                blockquote: ({ children, ...props }) => (
                  <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-4" {...props}>
                    {children}
                  </blockquote>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
