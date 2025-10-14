// components/onboarding/onboarding-navigation.tsx
// 온보딩 네비게이션 컴포넌트
// 이전/다음/완료/건너뛰기 버튼을 관리
// 관련 파일: components/onboarding/onboarding-container.tsx

import { Button } from '@/components/ui/button'

interface OnboardingNavigationProps {
  currentStep: number
  totalSteps: number
  onNext: () => void
  onPrevious: () => void
  onComplete: () => void
  onSkip: () => void
}

export default function OnboardingNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  onComplete,
  onSkip
}: OnboardingNavigationProps) {
  const isFirstStep = currentStep === 1
  const isLastStep = currentStep === totalSteps

  const handleNext = () => {
    onNext()
  }

  const handlePrevious = () => {
    onPrevious()
  }

  const handleComplete = () => {
    onComplete()
  }

  const handleSkip = () => {
    onSkip()
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200 bg-white">
      {/* 왼쪽: 이전 버튼 */}
      <div className="flex-1">
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            className="w-full sm:w-auto border-cyan-300 text-cyan-700 hover:bg-cyan-50"
          >
            ← 이전
          </Button>
        )}
      </div>

      {/* 중앙: 건너뛰기 버튼 */}
      <div className="flex-1 text-center">
        <Button
          type="button"
          variant="ghost"
          onClick={handleSkip}
          className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        >
          건너뛰기
        </Button>
      </div>

      {/* 오른쪽: 다음/완료 버튼 */}
      <div className="flex-1 text-right">
        {isLastStep ? (
          <Button
            type="button"
            onClick={handleComplete}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white border-0 shadow-lg"
          >
            완료하기 ✨
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNext}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white border-0 shadow-lg"
          >
            다음 →
          </Button>
        )}
      </div>
    </div>
  )
}
