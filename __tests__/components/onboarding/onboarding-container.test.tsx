// __tests__/components/onboarding/onboarding-container.test.tsx
// 온보딩 컨테이너 컴포넌트 테스트
// 온보딩 플로우의 메인 컨테이너 컴포넌트 테스트
// 관련 파일: components/onboarding/onboarding-container.tsx

import { render, screen, waitFor } from '@testing-library/react'
import { useRouter } from 'next/navigation'
import OnboardingContainer from '@/components/onboarding/onboarding-container'
import { useOnboarding } from '@/hooks/use-onboarding'

// Mock dependencies
jest.mock('next/navigation', () => ({
  useRouter: jest.fn()
}))

jest.mock('@/hooks/use-onboarding', () => ({
  useOnboarding: jest.fn()
}))

const mockPush = jest.fn()
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseOnboarding = useOnboarding as jest.MockedFunction<typeof useOnboarding>

describe('OnboardingContainer', () => {
  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: mockPush,
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn()
    })
    mockPush.mockClear()
  })

  it('로딩 중일 때 로딩 스피너를 표시한다', () => {
    mockUseOnboarding.mockReturnValue({
      isLoading: true,
      isCompleted: false,
      currentStep: 1,
      totalSteps: 3,
      error: null,
      goToNextStep: jest.fn(),
      goToPreviousStep: jest.fn(),
      goToStep: jest.fn(),
      completeOnboardingFlow: jest.fn(),
      skipOnboardingFlow: jest.fn(),
      clearError: jest.fn()
    })

    render(<OnboardingContainer />)
    
    expect(screen.getByText('온보딩 준비 중...')).toBeInTheDocument()
    expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument() // 스피너
  })

  it('온보딩이 완료된 경우 메인 페이지로 리다이렉션한다', async () => {
    mockUseOnboarding.mockReturnValue({
      isLoading: false,
      isCompleted: true,
      currentStep: 3,
      totalSteps: 3,
      error: null,
      goToNextStep: jest.fn(),
      goToPreviousStep: jest.fn(),
      goToStep: jest.fn(),
      completeOnboardingFlow: jest.fn(),
      skipOnboardingFlow: jest.fn(),
      clearError: jest.fn()
    })

    render(<OnboardingContainer />)
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  it('첫 번째 단계에서 환영 메시지를 표시한다', () => {
    mockUseOnboarding.mockReturnValue({
      isLoading: false,
      isCompleted: false,
      currentStep: 1,
      totalSteps: 3,
      error: null,
      goToNextStep: jest.fn(),
      goToPreviousStep: jest.fn(),
      goToStep: jest.fn(),
      completeOnboardingFlow: jest.fn(),
      skipOnboardingFlow: jest.fn(),
      clearError: jest.fn()
    })

    render(<OnboardingContainer />)
    
    expect(screen.getByText('AI 메모장에 오신 것을 환영합니다! 🎉')).toBeInTheDocument()
    expect(screen.getByText('몇 가지 간단한 단계를 통해 AI 메모장의 강력한 기능들을 알아보세요')).toBeInTheDocument()
  })

  it('에러가 있을 때 에러 메시지를 표시한다', () => {
    const mockClearError = jest.fn()
    mockUseOnboarding.mockReturnValue({
      isLoading: false,
      isCompleted: false,
      currentStep: 1,
      totalSteps: 3,
      error: '테스트 에러 메시지',
      goToNextStep: jest.fn(),
      goToPreviousStep: jest.fn(),
      goToStep: jest.fn(),
      completeOnboardingFlow: jest.fn(),
      skipOnboardingFlow: jest.fn(),
      clearError: mockClearError
    })

    render(<OnboardingContainer />)
    
    expect(screen.getByText('테스트 에러 메시지')).toBeInTheDocument()
    
    const closeButton = screen.getByRole('button', { name: '✕' })
    expect(closeButton).toBeInTheDocument()
    
    closeButton.click()
    expect(mockClearError).toHaveBeenCalled()
  })

  it('접근성 속성이 올바르게 설정되어 있다', () => {
    mockUseOnboarding.mockReturnValue({
      isLoading: false,
      isCompleted: false,
      currentStep: 1,
      totalSteps: 3,
      error: null,
      goToNextStep: jest.fn(),
      goToPreviousStep: jest.fn(),
      goToStep: jest.fn(),
      completeOnboardingFlow: jest.fn(),
      skipOnboardingFlow: jest.fn(),
      clearError: jest.fn()
    })

    render(<OnboardingContainer />)
    
    // 메인 헤딩이 있는지 확인
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    
    // 카드가 있는지 확인
    expect(screen.getByRole('region')).toBeInTheDocument()
  })
})
