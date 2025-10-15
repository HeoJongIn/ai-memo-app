// __tests__/components/ui/inline-edit.test.tsx
// InlineEdit 컴포넌트 테스트
// 인라인 편집 기능, 저장/취소, 키보드 단축키 테스트
// 편집 상태 관리와 사용자 인터랙션 검증

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InlineEdit } from '@/components/ui/inline-edit';

// Mock 함수들
const mockOnSave = jest.fn();
const mockOnCancel = jest.fn();

describe('InlineEdit', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('초기값을 올바르게 표시한다', () => {
      render(<InlineEdit value="테스트 텍스트" onSave={mockOnSave} />);
      
      expect(screen.getByText('테스트 텍스트')).toBeInTheDocument();
    });

    it('placeholder를 올바르게 표시한다', () => {
      render(<InlineEdit value="" onSave={mockOnSave} placeholder="편집할 내용을 입력하세요" />);
      
      expect(screen.getByText('편집할 내용을 입력하세요')).toBeInTheDocument();
    });

    it('편집 아이콘을 표시한다', () => {
      render(<InlineEdit value="테스트" onSave={mockOnSave} />);
      
      const editIcon = screen.getByTestId('edit-icon');
      expect(editIcon).toBeInTheDocument();
    });
  });

  describe('편집 모드 진입', () => {
    it('클릭 시 편집 모드로 진입한다', () => {
      render(<InlineEdit value="테스트" onSave={mockOnSave} />);
      
      const container = screen.getByText('테스트').closest('div');
      fireEvent.click(container!);
      
      expect(screen.getByDisplayValue('테스트')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /저장/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /취소/i })).toBeInTheDocument();
    });

    it('disabled 상태에서는 편집 모드로 진입하지 않는다', () => {
      render(<InlineEdit value="테스트" onSave={mockOnSave} disabled={true} />);
      
      const container = screen.getByText('테스트').closest('div');
      fireEvent.click(container!);
      
      expect(screen.queryByDisplayValue('테스트')).not.toBeInTheDocument();
    });
  });

  describe('편집 기능', () => {
    it('텍스트를 수정할 수 있다', async () => {
      const user = userEvent.setup();
      render(<InlineEdit value="원본" onSave={mockOnSave} />);
      
      const container = screen.getByText('원본').closest('div');
      fireEvent.click(container!);
      
      const input = screen.getByDisplayValue('원본');
      await user.clear(input);
      await user.type(input, '수정된 텍스트');
      
      expect(input).toHaveValue('수정된 텍스트');
    });

    it('저장 버튼 클릭 시 onSave를 호출한다', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);
      
      render(<InlineEdit value="원본" onSave={mockOnSave} />);
      
      const container = screen.getByText('원본').closest('div');
      fireEvent.click(container!);
      
      const input = screen.getByDisplayValue('원본');
      await user.clear(input);
      await user.type(input, '수정된 텍스트');
      
      const saveButton = screen.getByRole('button', { name: /저장/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('수정된 텍스트');
      });
    });

    it('취소 버튼 클릭 시 원본값으로 복원한다', async () => {
      const user = userEvent.setup();
      render(<InlineEdit value="원본" onSave={mockOnSave} onCancel={mockOnCancel} />);
      
      const container = screen.getByText('원본').closest('div');
      fireEvent.click(container!);
      
      const input = screen.getByDisplayValue('원본');
      await user.clear(input);
      await user.type(input, '수정된 텍스트');
      
      const cancelButton = screen.getByRole('button', { name: /취소/i });
      fireEvent.click(cancelButton);
      
      expect(mockOnCancel).toHaveBeenCalled();
      expect(screen.getByText('원본')).toBeInTheDocument();
    });
  });

  describe('키보드 단축키', () => {
    it('Enter 키로 저장한다', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);
      
      render(<InlineEdit value="원본" onSave={mockOnSave} />);
      
      const container = screen.getByText('원본').closest('div');
      fireEvent.click(container!);
      
      const input = screen.getByDisplayValue('원본');
      await user.clear(input);
      await user.type(input, '수정된 텍스트');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('수정된 텍스트');
      });
    });

    it('Escape 키로 취소한다', async () => {
      const user = userEvent.setup();
      render(<InlineEdit value="원본" onSave={mockOnSave} onCancel={mockOnCancel} />);
      
      const container = screen.getByText('원본').closest('div');
      fireEvent.click(container!);
      
      const input = screen.getByDisplayValue('원본');
      await user.clear(input);
      await user.type(input, '수정된 텍스트');
      await user.keyboard('{Escape}');
      
      expect(mockOnCancel).toHaveBeenCalled();
      expect(screen.getByText('원본')).toBeInTheDocument();
    });

    it('Ctrl+Enter로 멀티라인 텍스트를 저장한다', async () => {
      const user = userEvent.setup();
      mockOnSave.mockResolvedValue(undefined);
      
      render(<InlineEdit value="원본" onSave={mockOnSave} multiline={true} />);
      
      const container = screen.getByText('원본').closest('div');
      fireEvent.click(container!);
      
      const textarea = screen.getByDisplayValue('원본');
      await user.clear(textarea);
      await user.type(textarea, '수정된\n텍스트');
      await user.keyboard('{Control>}{Enter}{/Control}');
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('수정된\n텍스트');
      });
    });
  });

  describe('유효성 검사', () => {
    it('빈 텍스트는 저장할 수 없다', async () => {
      const user = userEvent.setup();
      render(<InlineEdit value="원본" onSave={mockOnSave} />);
      
      const container = screen.getByText('원본').closest('div');
      fireEvent.click(container!);
      
      const input = screen.getByDisplayValue('원본');
      await user.clear(input);
      
      const saveButton = screen.getByRole('button', { name: /저장/i });
      expect(saveButton).toBeDisabled();
    });

    it('최대 길이를 초과하면 저장할 수 없다', async () => {
      const user = userEvent.setup();
      render(<InlineEdit value="원본" onSave={mockOnSave} maxLength={5} />);
      
      const container = screen.getByText('원본').closest('div');
      fireEvent.click(container!);
      
      const input = screen.getByDisplayValue('원본');
      await user.clear(input);
      await user.type(input, '123456'); // 6자 입력 시도
      
      // HTML maxLength로 인해 실제로는 5자만 입력됨
      expect(input).toHaveValue('12345');
      
      const saveButton = screen.getByRole('button', { name: /저장/i });
      // 5자이므로 저장 버튼이 활성화되어야 함
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('로딩 상태', () => {
    it('저장 중에는 로딩 스피너를 표시한다', async () => {
      const user = userEvent.setup();
      mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(<InlineEdit value="원본" onSave={mockOnSave} />);
      
      const container = screen.getByText('원본').closest('div');
      fireEvent.click(container!);
      
      const input = screen.getByDisplayValue('원본');
      await user.clear(input);
      await user.type(input, '수정된 텍스트');
      
      const saveButton = screen.getByRole('button', { name: /저장/i });
      fireEvent.click(saveButton);
      
      expect(screen.getByRole('button', { name: /저장/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /취소/i })).toBeDisabled();
    });
  });

  describe('외부 클릭', () => {
    it('외부 클릭 시 편집을 취소한다', async () => {
      const user = userEvent.setup();
      render(<InlineEdit value="원본" onSave={mockOnSave} onCancel={mockOnCancel} />);
      
      const container = screen.getByText('원본').closest('div');
      fireEvent.click(container!);
      
      const input = screen.getByDisplayValue('원본');
      await user.clear(input);
      await user.type(input, '수정된 텍스트');
      
      // 외부 클릭
      fireEvent.mouseDown(document.body);
      
      expect(mockOnCancel).toHaveBeenCalled();
      expect(screen.getByText('원본')).toBeInTheDocument();
    });
  });

  describe('커스텀 children', () => {
    it('커스텀 children을 렌더링한다', () => {
      render(
        <InlineEdit value="원본" onSave={mockOnSave}>
          <div data-testid="custom-content">커스텀 내용</div>
        </InlineEdit>
      );
      
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });
  });
});
