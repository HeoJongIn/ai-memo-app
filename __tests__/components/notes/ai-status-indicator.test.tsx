// __tests__/components/notes/ai-status-indicator.test.tsx
// AI 상태 표시 컴포넌트 테스트
// 상태별 렌더링, 애니메이션 효과, 사용자 인터랙션 검증

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIStatusIndicator } from '@/components/notes/ai-status-indicator';
import { useToast } from '@/components/ui/toast';
import '@testing-library/jest-dom';

// Mock the toast hook
jest.mock('@/components/ui/toast', () => ({
  useToast: jest.fn(),
}));

const mockUseToast = useToast as jest.Mock;
const mockAddToast = jest.fn();

describe('AIStatusIndicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseToast.mockReturnValue({ addToast: mockAddToast });
  });

  it('idle 상태일 때 렌더링되지 않는다', () => {
    render(
      <AIStatusIndicator
        status="idle"
        processType={null}
        message=""
      />
    );

    expect(screen.queryByText('요약')).not.toBeInTheDocument();
    expect(screen.queryByText('태그')).not.toBeInTheDocument();
  });

  it('로딩 상태를 올바르게 렌더링한다', () => {
    render(
      <AIStatusIndicator
        status="loading"
        processType="summary"
        message="요약 생성 중..."
      />
    );

    expect(screen.getByText('요약')).toBeInTheDocument();
    expect(screen.getByText('요약 생성 중...')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // 스피너
  });

  it('성공 상태를 올바르게 렌더링한다', () => {
    render(
      <AIStatusIndicator
        status="success"
        processType="tags"
        message="태그 생성 완료"
      />
    );

    expect(screen.getByText('태그')).toBeInTheDocument();
    expect(screen.getByText('태그 생성 완료')).toBeInTheDocument();
    expect(screen.getByText('처리가 완료되었습니다!')).toBeInTheDocument();
  });

  it('에러 상태를 올바르게 렌더링한다', () => {
    const mockOnRetry = jest.fn();
    const mockOnClearError = jest.fn();

    render(
      <AIStatusIndicator
        status="error"
        processType="summary"
        message="요약 생성 실패"
        error="API 연결 오류"
        onRetry={mockOnRetry}
        onClearError={mockOnClearError}
      />
    );

    expect(screen.getByText('요약')).toBeInTheDocument();
    expect(screen.getByText('요약 생성 실패')).toBeInTheDocument();
    expect(screen.getByText('API 연결 오류')).toBeInTheDocument();
    expect(screen.getByText('재시도')).toBeInTheDocument();
    expect(screen.getByText('닫기')).toBeInTheDocument();
  });

  it('재시도 버튼 클릭 시 onRetry를 호출한다', () => {
    const mockOnRetry = jest.fn();

    render(
      <AIStatusIndicator
        status="error"
        processType="summary"
        message="요약 생성 실패"
        error="API 오류"
        onRetry={mockOnRetry}
      />
    );

    const retryButton = screen.getByText('재시도');
    fireEvent.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('닫기 버튼 클릭 시 onClearError를 호출한다', () => {
    const mockOnClearError = jest.fn();

    render(
      <AIStatusIndicator
        status="error"
        processType="summary"
        message="요약 생성 실패"
        error="API 오류"
        onClearError={mockOnClearError}
      />
    );

    const closeButton = screen.getByText('닫기');
    fireEvent.click(closeButton);

    expect(mockOnClearError).toHaveBeenCalledTimes(1);
  });

  it('에러 발생 시 토스트 메시지를 표시한다', () => {
    render(
      <AIStatusIndicator
        status="error"
        processType="summary"
        message="요약 생성 실패"
        error="API 연결 오류"
      />
    );

    expect(mockAddToast).toHaveBeenCalledWith({
      title: 'AI 처리 실패',
      description: 'API 연결 오류',
      variant: 'destructive',
    });
  });

  it('프로세스 타입에 따라 올바른 라벨을 표시한다', () => {
    const { rerender } = render(
      <AIStatusIndicator
        status="loading"
        processType="summary"
        message="요약 생성 중..."
      />
    );

    expect(screen.getByText('요약')).toBeInTheDocument();

    rerender(
      <AIStatusIndicator
        status="loading"
        processType="tags"
        message="태그 생성 중..."
      />
    );

    expect(screen.getByText('태그')).toBeInTheDocument();
  });

  it('성공 상태에서 애니메이션 효과가 적용된다', () => {
    render(
      <AIStatusIndicator
        status="success"
        processType="summary"
        message="요약 생성 완료"
      />
    );

    const successMessage = screen.getByText('처리가 완료되었습니다!');
    expect(successMessage).toBeInTheDocument();
    
    // 애니메이션 클래스 확인
    const bounceElement = successMessage.parentElement?.querySelector('.animate-bounce');
    expect(bounceElement).toBeInTheDocument();
  });

  it('로딩 상태에서 스피너 애니메이션이 적용된다', () => {
    render(
      <AIStatusIndicator
        status="loading"
        processType="summary"
        message="요약 생성 중..."
      />
    );

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('에러 상태에서 적절한 스타일이 적용된다', () => {
    render(
      <AIStatusIndicator
        status="error"
        processType="summary"
        message="요약 생성 실패"
        error="API 오류"
      />
    );

    const card = screen.getByText('요약').closest('.border-red-200');
    expect(card).toBeInTheDocument();
  });

  it('성공 상태에서 적절한 스타일이 적용된다', () => {
    render(
      <AIStatusIndicator
        status="success"
        processType="summary"
        message="요약 생성 완료"
      />
    );

    const card = screen.getByText('요약').closest('.border-green-200');
    expect(card).toBeInTheDocument();
  });

  it('로딩 상태에서 적절한 스타일이 적용된다', () => {
    render(
      <AIStatusIndicator
        status="loading"
        processType="summary"
        message="요약 생성 중..."
      />
    );

    const card = screen.getByText('요약').closest('.border-blue-200');
    expect(card).toBeInTheDocument();
  });
});
