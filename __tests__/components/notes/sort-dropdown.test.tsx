// __tests__/components/notes/sort-dropdown.test.tsx
// 정렬 드롭다운 컴포넌트 테스트
// 드롭다운 렌더링, 정렬 옵션 변경, URL 상태 관리를 테스트
// Jest와 React Testing Library를 사용한 단위 테스트

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SortDropdown } from '@/components/notes/sort-dropdown';

// Mock 설정
const mockPush = jest.fn();
const mockSearchParams = {
  get: jest.fn(),
  toString: jest.fn().mockReturnValue(''),
  forEach: jest.fn(),
};

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('SortDropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.get.mockReturnValue('latest');
    mockSearchParams.forEach.mockImplementation(() => {}); // 빈 함수로 초기화
  });

  it('renders sort dropdown with default options', () => {
    render(<SortDropdown />);

    expect(screen.getByText('정렬:')).toBeInTheDocument();
    expect(screen.getByText('최신순')).toBeInTheDocument();
  });

  it('displays current sort option correctly', () => {
    render(<SortDropdown currentSort="title" />);

    expect(screen.getByText('제목순')).toBeInTheDocument();
  });

  it('shows all sort options when opened', () => {
    render(<SortDropdown />);

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    expect(screen.getAllByText('최신순')).toHaveLength(2); // 트리거와 옵션에서 각각
    expect(screen.getByText('제목순')).toBeInTheDocument();
    expect(screen.getByText('오래된순')).toBeInTheDocument();
  });

  it('handles sort option change', async () => {
    render(<SortDropdown />);

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const titleOption = screen.getByText('제목순');
    fireEvent.click(titleOption);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/notes?sort=title');
    });
  });

  it('resets pagination when sort changes', async () => {
    mockSearchParams.get.mockImplementation((key) => {
      if (key === 'sort') return 'latest';
      if (key === 'page') return '3';
      return null;
    });

    render(<SortDropdown />);

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const titleOption = screen.getByText('제목순');
    fireEvent.click(titleOption);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/notes?sort=title');
    });
  });

  it('shows loading state when changing sort', async () => {
    render(<SortDropdown />);

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    const titleOption = screen.getByText('제목순');
    fireEvent.click(titleOption);

    // 변경 중 상태 확인
    expect(screen.getByText('변경 중...')).toBeInTheDocument();
  });

  it('disables dropdown when loading', () => {
    render(<SortDropdown isLoading={true} />);

    const trigger = screen.getByRole('combobox');
    expect(trigger).toBeDisabled();
  });

  it('shows current sort indicator', () => {
    render(<SortDropdown currentSort="title" />);

    const trigger = screen.getByRole('combobox');
    fireEvent.click(trigger);

    // 현재 선택된 옵션에 체크 표시 확인
    const checkmark = screen.getByText('✓');
    expect(checkmark).toBeInTheDocument();
  });

  it('handles invalid sort option gracefully', () => {
    render(<SortDropdown currentSort="invalid" as any />);

    // 잘못된 정렬 옵션이 있을 때 기본값 사용
    expect(screen.getByText('최신순')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SortDropdown className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});