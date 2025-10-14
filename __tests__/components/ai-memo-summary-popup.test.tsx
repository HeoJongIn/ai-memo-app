// __tests__/components/ai-memo-summary-popup.test.tsx
// AI 메모장 요약 팝업 컴포넌트 테스트
// 팝업 렌더링, 기능 카드 표시, 상세 정보 토글을 테스트
// Jest와 React Testing Library를 사용한 단위 테스트

import { render, screen, fireEvent } from '@testing-library/react';
import AIMemoSummaryPopup from '@/components/ai-memo-summary-popup';

describe('AIMemoSummaryPopup', () => {
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders popup when open is true', () => {
    render(
      <AIMemoSummaryPopup 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    expect(screen.getByText('AI 메모장')).toBeInTheDocument();
    expect(screen.getByText('음성 인식과 AI로 더 스마트한 메모 관리')).toBeInTheDocument();
  });

  it('does not render popup when open is false', () => {
    render(
      <AIMemoSummaryPopup 
        open={false} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    expect(screen.queryByText('AI 메모장')).not.toBeInTheDocument();
  });

  it('displays all feature cards in summary view', () => {
    render(
      <AIMemoSummaryPopup 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // 주요 기능들 확인
    expect(screen.getByText('음성 인식')).toBeInTheDocument();
    expect(screen.getByText('AI 요약')).toBeInTheDocument();
    expect(screen.getByText('자동 태깅')).toBeInTheDocument();
    expect(screen.getByText('노트 관리')).toBeInTheDocument();
    expect(screen.getByText('실시간 저장')).toBeInTheDocument();
    expect(screen.getByText('검색 & 필터')).toBeInTheDocument();
  });

  it('shows feature descriptions in summary view', () => {
    render(
      <AIMemoSummaryPopup 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    expect(screen.getByText('음성을 실시간으로 텍스트로 변환')).toBeInTheDocument();
    expect(screen.getByText('메모 내용을 AI가 자동으로 요약')).toBeInTheDocument();
    expect(screen.getByText('관련 태그를 자동으로 생성')).toBeInTheDocument();
  });

  it('toggles to detailed view when "자세히 보기" button is clicked', () => {
    render(
      <AIMemoSummaryPopup 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    const detailButton = screen.getByText('자세히 보기');
    fireEvent.click(detailButton);

    expect(screen.getByText('기능 상세 설명')).toBeInTheDocument();
    expect(screen.getByText('각 기능의 자세한 내용을 확인해보세요')).toBeInTheDocument();
  });

  it('shows detailed descriptions in detailed view', () => {
    render(
      <AIMemoSummaryPopup 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // 상세 보기로 전환
    const detailButton = screen.getByText('자세히 보기');
    fireEvent.click(detailButton);

    // 상세 설명 확인
    expect(screen.getByText(/마이크를 통해 말하는 내용이 자동으로 텍스트로 변환/)).toBeInTheDocument();
    expect(screen.getByText(/긴 메모 내용을 핵심 포인트로 요약/)).toBeInTheDocument();
    expect(screen.getByText(/메모 내용을 분석하여 관련 태그를 자동으로 생성/)).toBeInTheDocument();
  });

  it('toggles back to summary view when "요약으로 돌아가기" button is clicked', () => {
    render(
      <AIMemoSummaryPopup 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // 상세 보기로 전환
    const detailButton = screen.getByText('자세히 보기');
    fireEvent.click(detailButton);

    // 요약으로 돌아가기
    const backButton = screen.getByText('요약으로 돌아가기');
    fireEvent.click(backButton);

    expect(screen.getByText('주요 기능')).toBeInTheDocument();
    expect(screen.getByText('AI 메모장의 핵심 기능들을 확인해보세요')).toBeInTheDocument();
  });

  it('calls onOpenChange when close button is clicked', () => {
    render(
      <AIMemoSummaryPopup 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    const closeButton = screen.getByLabelText('팝업 닫기');
    fireEvent.click(closeButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange when "바로 시작하기" button is clicked', () => {
    render(
      <AIMemoSummaryPopup 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    const startButton = screen.getByText('바로 시작하기');
    fireEvent.click(startButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onOpenChange when "시작하기" button is clicked in detailed view', () => {
    render(
      <AIMemoSummaryPopup 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // 상세 보기로 전환
    const detailButton = screen.getByText('자세히 보기');
    fireEvent.click(detailButton);

    // 시작하기 버튼 클릭
    const startButton = screen.getByText('시작하기');
    fireEvent.click(startButton);

    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });

  it('has proper accessibility attributes', () => {
    render(
      <AIMemoSummaryPopup 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // 제목이 h2 태그인지 확인 (여러 개의 h2가 있으므로 getAllByRole 사용)
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings.length).toBeGreaterThan(0);
    
    // 메인 제목 확인
    const mainTitle = screen.getByText('AI 메모장');
    expect(mainTitle).toBeInTheDocument();

    // 닫기 버튼의 aria-label 확인
    const closeButton = screen.getByLabelText('팝업 닫기');
    expect(closeButton).toBeInTheDocument();
  });

  it('displays feature icons correctly', () => {
    render(
      <AIMemoSummaryPopup 
        open={true} 
        onOpenChange={mockOnOpenChange} 
      />
    );

    // SVG 요소들을 직접 찾기 (Lucide React 아이콘들은 SVG로 렌더링됨)
    const svgs = document.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
    
    // 특정 아이콘 클래스가 있는지 확인
    const micIcon = document.querySelector('.lucide-mic');
    expect(micIcon).toBeInTheDocument();
  });
});
