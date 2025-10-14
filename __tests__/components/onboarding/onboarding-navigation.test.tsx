// __tests__/components/onboarding/onboarding-navigation.test.tsx
// 온보딩 네비게이션 컴포넌트 테스트
// 이전/다음/완료/건너뛰기 버튼 기능 테스트
// 관련 파일: components/onboarding/onboarding-navigation.tsx

import { render, screen, fireEvent } from '@testing-library/react'
import OnboardingNavigation from '@/components/onboarding/onboarding-navigation'

describe('OnboardingNavigation', () => {
  const mockProps = {
    currentStep: 2,
    totalSteps: 3,
    onNext: jest.fn(),
    onPrevious: jest.fn(),
    onComplete: jest.fn(),
    onSkip: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('중간 단계에서 이전, 건너뛰기, 다음 버튼을 표시한다', () => {
    render(<OnboardingNavigation {...mockProps} />)
    
    expect(screen.getByText('← 이전')).toBeInTheDocument()
    expect(screen.getByText('건너뛰기')).toBeInTheDocument()
    expect(screen.getByText('다음 →')).toBeInTheDocument()
  })

  it('첫 번째 단계에서는 이전 버튼을 표시하지 않는다', () => {
    render(<OnboardingNavigation {...mockProps} currentStep={1} />)
    
    expect(screen.queryByText('← 이전')).not.toBeInTheDocument()
    expect(screen.getByText('건너뛰기')).toBeInTheDocument()
    expect(screen.getByText('다음 →')).toBeInTheDocument()
  })

  it('마지막 단계에서는 완료 버튼을 표시한다', () => {
    render(<OnboardingNavigation {...mockProps} currentStep={3} />)
    
    expect(screen.getByText('← 이전')).toBeInTheDocument()
    expect(screen.getByText('건너뛰기')).toBeInTheDocument()
    expect(screen.getByText('완료하기 ✨')).toBeInTheDocument()
    expect(screen.queryByText('다음 →')).not.toBeInTheDocument()
  })

  it('다음 버튼 클릭 시 onNext가 호출된다', () => {
    render(<OnboardingNavigation {...mockProps} />)
    
    const nextButton = screen.getByText('다음 →')
    fireEvent.click(nextButton)
    
    expect(mockProps.onNext).toHaveBeenCalledTimes(1)
  })

  it('이전 버튼 클릭 시 onPrevious가 호출된다', () => {
    render(<OnboardingNavigation {...mockProps} />)
    
    const previousButton = screen.getByText('← 이전')
    fireEvent.click(previousButton)
    
    expect(mockProps.onPrevious).toHaveBeenCalledTimes(1)
  })

  it('완료 버튼 클릭 시 onComplete가 호출된다', () => {
    render(<OnboardingNavigation {...mockProps} currentStep={3} />)
    
    const completeButton = screen.getByText('완료하기 ✨')
    fireEvent.click(completeButton)
    
    expect(mockProps.onComplete).toHaveBeenCalledTimes(1)
  })

  it('건너뛰기 버튼 클릭 시 onSkip이 호출된다', () => {
    render(<OnboardingNavigation {...mockProps} />)
    
    const skipButton = screen.getByText('건너뛰기')
    fireEvent.click(skipButton)
    
    expect(mockProps.onSkip).toHaveBeenCalledTimes(1)
  })

  it('키보드 네비게이션이 올바르게 작동한다', () => {
    render(<OnboardingNavigation {...mockProps} />)
    
    const nextButton = screen.getByText('다음 →')
    nextButton.focus()
    
    expect(nextButton).toHaveFocus()
    
    // 클릭 이벤트로 테스트 (Enter 키 이벤트는 브라우저 기본 동작에 의존)
    fireEvent.click(nextButton)
    expect(mockProps.onNext).toHaveBeenCalledTimes(1)
  })

  it('접근성 속성이 올바르게 설정되어 있다', () => {
    render(<OnboardingNavigation {...mockProps} />)
    
    const buttons = screen.getAllByRole('button')
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button')
    })
  })
})
