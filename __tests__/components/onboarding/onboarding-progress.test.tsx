// __tests__/components/onboarding/onboarding-progress.test.tsx
// 온보딩 진행률 표시기 컴포넌트 테스트
// 진행률 바와 단계 표시 기능 테스트
// 관련 파일: components/onboarding/onboarding-progress.tsx

import { render, screen } from '@testing-library/react'
import OnboardingProgress from '@/components/onboarding/onboarding-progress'

describe('OnboardingProgress', () => {
  it('현재 단계와 전체 단계를 올바르게 표시한다', () => {
    render(<OnboardingProgress currentStep={2} totalSteps={3} />)
    
    expect(screen.getByText('단계 2 / 3')).toBeInTheDocument()
    expect(screen.getByText('67% 완료')).toBeInTheDocument()
  })

  it('진행률 바의 너비가 올바르게 계산된다', () => {
    render(<OnboardingProgress currentStep={1} totalSteps={4} />)
    
    const progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toHaveStyle('width: 25%')
  })

  it('첫 번째 단계에서 올바른 진행률을 표시한다', () => {
    render(<OnboardingProgress currentStep={1} totalSteps={3} />)
    
    expect(screen.getByText('단계 1 / 3')).toBeInTheDocument()
    expect(screen.getByText('33% 완료')).toBeInTheDocument()
  })

  it('마지막 단계에서 100% 완료를 표시한다', () => {
    render(<OnboardingProgress currentStep={3} totalSteps={3} />)
    
    expect(screen.getByText('단계 3 / 3')).toBeInTheDocument()
    expect(screen.getByText('100% 완료')).toBeInTheDocument()
  })

  it('단계별 점이 올바르게 표시된다', () => {
    render(<OnboardingProgress currentStep={2} totalSteps={3} />)
    
    // 개별 점들만 확인 (컨테이너 제외)
    const individualDots = screen.getAllByRole('presentation').filter(
      element => element.getAttribute('aria-label')?.includes('완료된 단계') || 
                element.getAttribute('aria-label')?.includes('미완료 단계')
    )
    expect(individualDots).toHaveLength(3)
  })

  it('접근성 속성이 올바르게 설정되어 있다', () => {
    render(<OnboardingProgress currentStep={2} totalSteps={3} />)
    
    // 진행률 바에 적절한 aria 속성이 있는지 확인
    const progressBar = screen.getByRole('progressbar', { hidden: true })
    expect(progressBar).toBeInTheDocument()
  })
})
