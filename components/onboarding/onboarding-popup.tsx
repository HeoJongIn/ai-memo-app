// components/onboarding/onboarding-popup.tsx
// 온보딩 팝업 컴포넌트
// 메인 페이지에서 팝업으로 온보딩을 표시하는 컴포넌트
// 관련 파일: components/onboarding/onboarding-container.tsx

'use client'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import OnboardingContainer from './onboarding-container'

interface OnboardingPopupProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function OnboardingPopup({ open, onOpenChange }: OnboardingPopupProps) {

  const handleOnboardingComplete = () => {
    onOpenChange(false)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[98vw] h-[90vh] p-0 bg-transparent border-0">
        <DialogTitle className="sr-only">AI 메모장 온보딩</DialogTitle>
        <div className="relative w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* 닫기 버튼 */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            aria-label="온보딩 닫기"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* 온보딩 컨테이너 */}
          <div className="h-full overflow-hidden">
            <OnboardingContainer onComplete={handleOnboardingComplete} isPopup={true} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
