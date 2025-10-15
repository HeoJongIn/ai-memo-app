// components/notes/sort-dropdown.tsx
// 노트 정렬 옵션 드롭다운 컴포넌트
// 사용자가 노트 목록을 다양한 기준으로 정렬할 수 있는 UI
// shadcn/ui Select 컴포넌트를 사용하여 구현

'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type SortOption = 'latest' | 'title' | 'oldest';

interface SortDropdownProps {
  currentSort?: SortOption;
  isLoading?: boolean;
  className?: string;
}

const sortOptions = [
  { value: 'latest', label: '최신순' },
  { value: 'title', label: '제목순' },
  { value: 'oldest', label: '오래된순' },
] as const;

export function SortDropdown({ 
  currentSort = 'latest', 
  isLoading = false,
  className = ''
}: SortDropdownProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isChanging, setIsChanging] = useState(false);

  const handleSortChange = async (value: SortOption) => {
    setIsChanging(true);
    
    try {
      // URL 파라미터 업데이트 (페이지네이션 리셋)
      const params = new URLSearchParams();
      
      // 현재 검색 파라미터들을 복사
      searchParams.forEach((val, key) => {
        if (key !== 'sort' && key !== 'page') {
          params.set(key, val);
        }
      });
      
      params.set('sort', value);
      // page는 자동으로 제거됨 (첫 페이지로 리셋)
      
      // URL 업데이트
      router.push(`/notes?${params.toString()}`);
    } catch (error) {
      console.error('Error updating sort:', error);
    } finally {
      // 짧은 지연 후 로딩 상태 해제 (사용자 피드백을 위해)
      setTimeout(() => setIsChanging(false), 300);
    }
  };

  const currentOption = sortOptions.find(option => option.value === currentSort) || sortOptions[0];

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        정렬:
      </span>
      <Select
        value={currentSort}
        onValueChange={handleSortChange}
        disabled={isLoading || isChanging}
      >
        <SelectTrigger className="w-[120px] h-9">
          <SelectValue placeholder="정렬 선택">
            {isChanging ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs">변경 중...</span>
              </div>
            ) : (
              currentOption.label
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <span>{option.label}</span>
                {option.value === currentSort && (
                  <span className="text-xs text-blue-600 dark:text-blue-400">✓</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
