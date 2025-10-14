// components/onboarding/onboarding-progress.tsx
// 온보딩 진행률 표시기 컴포넌트
// 현재 단계와 전체 단계를 시각적으로 표시
// 관련 파일: components/onboarding/onboarding-container.tsx

interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
}

export default function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const progressPercentage = (currentStep / totalSteps) * 100

  return (
    <div className="mb-8 max-w-md mx-auto">
      {/* 진행률 바 */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-gradient-to-r from-emerald-500 to-violet-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`온보딩 진행률: ${Math.round(progressPercentage)}%`}
        />
      </div>
      
      {/* 단계 표시 */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          단계 {currentStep} / {totalSteps}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {Math.round(progressPercentage)}% 완료
        </span>
      </div>
      
      {/* 단계별 점 표시 */}
      <div className="flex justify-center space-x-2 mt-4" role="presentation" aria-label="온보딩 단계 표시">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index + 1 <= currentStep
                ? 'bg-gradient-to-r from-emerald-500 to-violet-600'
                : 'bg-gray-300'
            }`}
            role="presentation"
            aria-label={index + 1 <= currentStep ? `완료된 단계 ${index + 1}` : `미완료 단계 ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
