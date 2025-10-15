// components/ui/inline-edit.tsx
// 인라인 편집을 위한 공통 컴포넌트
// 텍스트 편집, 저장/취소 기능, 키보드 단축키 지원
// 편집 상태 관리와 애니메이션 포함

'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Edit3 } from 'lucide-react';

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => Promise<void>;
  onCancel?: () => void;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function InlineEdit({
  value,
  onSave,
  onCancel,
  placeholder = '편집할 내용을 입력하세요',
  maxLength = 2000,
  multiline = false,
  className = '',
  disabled = false,
  children
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // 편집 모드 진입
  const startEditing = () => {
    if (disabled) return;
    setEditValue(value);
    setIsEditing(true);
  };

  // 편집 취소
  const cancelEditing = () => {
    setEditValue(value);
    setIsEditing(false);
    onCancel?.();
  };

  // 편집 저장
  const saveEditing = async () => {
    console.log('saveEditing called, editValue:', editValue, 'value:', value);
    
    if (editValue.trim() === value.trim()) {
      console.log('No changes detected, exiting edit mode');
      setIsEditing(false);
      return;
    }

    if (editValue.trim().length === 0) {
      console.log('Empty value, not saving');
      return;
    }

    console.log('Starting save process...');
    setIsSaving(true);
    try {
      console.log('Calling onSave with:', editValue.trim());
      await onSave(editValue.trim());
      console.log('onSave completed successfully, exiting edit mode');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
      // 에러가 발생해도 편집 모드는 유지하여 사용자가 다시 시도할 수 있도록 함
    } finally {
      console.log('Setting isSaving to false');
      setIsSaving(false);
    }
  };

  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      saveEditing();
    } else if (e.key === 'Enter' && multiline && e.ctrlKey) {
      e.preventDefault();
      saveEditing();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEditing();
    }
  };

  // 편집 모드 진입 시 포커스
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (multiline) {
        (inputRef.current as HTMLTextAreaElement).select();
      }
    }
  }, [isEditing, multiline]);

  // 외부 클릭 시 편집 취소
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isEditing && inputRef.current) {
        const target = event.target as Node;
        // 입력 필드나 버튼 영역이 아닌 경우에만 취소
        const isInputField = inputRef.current.contains(target);
        const isButton = (target as Element)?.closest('button') !== null;
        
        if (!isInputField && !isButton) {
          console.log('Outside click detected, canceling edit');
          cancelEditing();
        }
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            className="flex-1 min-h-[60px] p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSaving}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            className="flex-1 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSaving}
          />
        )}
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="outline"
            onMouseDown={() => console.log('Save button mousedown!')}
            onClick={() => {
              console.log('Save button clicked!');
              saveEditing();
            }}
            disabled={(() => {
              const disabled = isSaving || editValue.trim().length === 0 || editValue.length > maxLength;
              console.log('Save button disabled check:', {
                isSaving,
                editValueLength: editValue.trim().length,
                editValueFullLength: editValue.length,
                maxLength,
                disabled
              });
              return disabled;
            })()}
            className="h-8 w-8 p-0 cursor-pointer hover:bg-green-50"
            aria-label="저장"
          >
            {isSaving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
            ) : (
              <Check className="h-4 w-4 text-green-600" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={cancelEditing}
            disabled={isSaving}
            className="h-8 w-8 p-0"
            aria-label="취소"
          >
            <X className="h-4 w-4 text-red-600" />
          </Button>
        </div>
        {maxLength && (
          <span className="text-xs text-gray-500">
            {editValue.length}/{maxLength}
          </span>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`group cursor-pointer hover:bg-gray-50 rounded-md p-1 transition-colors ${className}`}
      onClick={startEditing}
    >
      <div className="flex items-center gap-2">
        {children || (
          <span className="flex-1">{value || placeholder}</span>
        )}
        {!disabled && (
          <Edit3 
            className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" 
            data-testid="edit-icon"
          />
        )}
      </div>
    </div>
  );
}
