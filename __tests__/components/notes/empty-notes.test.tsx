// __tests__/components/notes/empty-notes.test.tsx
// 빈 노트 상태 컴포넌트 테스트
// 컴포넌트 렌더링, 버튼 클릭, 접근성, 반응형 디자인을 테스트
// Jest와 React Testing Library를 사용한 단위 테스트

import { render, screen, fireEvent } from '@testing-library/react';
import { EmptyNotes } from '@/components/notes/empty-notes';

// Mock 설정
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('EmptyNotes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state UI with all required elements', () => {
    render(<EmptyNotes />);

    // 메인 제목 확인
    expect(screen.getByText('아직 작성한 노트가 없습니다')).toBeInTheDocument();
    
    // 온보딩 메시지 확인
    expect(screen.getByText(/첫 번째 노트를 작성해보세요/)).toBeInTheDocument();
    
    // CTA 버튼 확인
    expect(screen.getByRole('button', { name: /첫 노트 작성하기/ })).toBeInTheDocument();
    
    // 노트 작성의 장점 섹션 확인
    expect(screen.getByText('노트 작성의 장점')).toBeInTheDocument();
  });

  it('displays all benefit cards with correct icons and text', () => {
    render(<EmptyNotes />);

    // 아이디어 정리 카드
    expect(screen.getByText('아이디어 정리')).toBeInTheDocument();
    
    // 목표 관리 카드
    expect(screen.getByText('목표 관리')).toBeInTheDocument();
    
    // 생산성 향상 카드
    expect(screen.getByText('생산성 향상')).toBeInTheDocument();
  });

  it('handles create note button click', () => {
    render(<EmptyNotes />);

    const createButton = screen.getByRole('button', { name: /첫 노트 작성하기/ });
    fireEvent.click(createButton);

    expect(mockPush).toHaveBeenCalledWith('/notes/create');
  });

  it('has proper accessibility attributes', () => {
    render(<EmptyNotes />);

    // region 역할 확인
    const region = screen.getByRole('region');
    expect(region).toBeInTheDocument();
    
    // aria-labelledby 확인
    expect(region).toHaveAttribute('aria-labelledby', 'empty-state-title');
    
    // 제목 ID 확인
    const title = screen.getByText('아직 작성한 노트가 없습니다');
    expect(title).toHaveAttribute('id', 'empty-state-title');
    
    // 버튼 aria-describedby 확인
    const button = screen.getByRole('button', { name: /첫 노트 작성하기/ });
    expect(button).toHaveAttribute('aria-describedby', 'empty-state-description');
    
    // 설명 ID 확인
    const description = screen.getByText('언제든지 수정하고 삭제할 수 있습니다');
    expect(description).toHaveAttribute('id', 'empty-state-description');
  });

  it('has proper ARIA labels for icons', () => {
    render(<EmptyNotes />);

    // 메인 아이콘 aria-label 확인
    const iconContainer = screen.getByRole('img', { name: /빈 노트 상태를 나타내는 아이콘/ });
    expect(iconContainer).toBeInTheDocument();
  });

  it('applies correct styling classes for dark mode', () => {
    render(<EmptyNotes />);

    // 다크 모드 클래스 확인
    const title = screen.getByText('아직 작성한 노트가 없습니다');
    expect(title).toHaveClass('dark:text-white');
    
    const description = screen.getByText(/첫 번째 노트를 작성해보세요/);
    expect(description).toHaveClass('dark:text-gray-400');
  });

  it('has responsive design classes', () => {
    render(<EmptyNotes />);

    // 반응형 그리드 클래스 확인
    const benefitsSection = screen.getByText('노트 작성의 장점').parentElement;
    const benefitsGrid = benefitsSection?.querySelector('.grid');
    expect(benefitsGrid).toHaveClass('grid-cols-1', 'sm:grid-cols-3');
  });

  it('displays additional helpful text', () => {
    render(<EmptyNotes />);

    // 추가 설명 텍스트 확인
    expect(screen.getByText('언제든지 수정하고 삭제할 수 있습니다')).toBeInTheDocument();
  });

  it('has proper focus management', () => {
    render(<EmptyNotes />);

    const button = screen.getByRole('button', { name: /첫 노트 작성하기/ });
    
    // 포커스 링 클래스 확인
    expect(button).toHaveClass('focus:ring-2', 'focus:ring-emerald-500');
  });

  it('renders with proper semantic HTML structure', () => {
    render(<EmptyNotes />);

    // 제목이 h2 태그인지 확인
    const title = screen.getByRole('heading', { level: 2 });
    expect(title).toBeInTheDocument();
    expect(title).toHaveTextContent('아직 작성한 노트가 없습니다');
    
    // 부제목이 h3 태그인지 확인
    const subtitle = screen.getByRole('heading', { level: 3 });
    expect(subtitle).toBeInTheDocument();
    expect(subtitle).toHaveTextContent('노트 작성의 장점');
  });
});
