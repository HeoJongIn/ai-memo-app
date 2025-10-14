// components/onboarding/steps/welcome-step.tsx
// 온보딩 첫 번째 단계 - 앱 소개 및 주요 기능 설명
// AI 메모장의 핵심 기능들을 소개하는 컴포넌트
// 관련 파일: components/onboarding/onboarding-container.tsx

import { Card, CardContent } from '@/components/ui/card'

export default function WelcomeStep({ isPopup = false }: { isPopup?: boolean }) {
  const features = [
    {
      icon: '🎤',
      title: '음성 메모',
      description: '음성을 실시간으로 텍스트로 변환하여 빠르고 편리하게 메모를 작성하세요'
    },
    {
      icon: '🤖',
      title: 'AI 요약',
      description: 'AI가 메모 내용을 분석하여 핵심 내용을 자동으로 요약해드립니다'
    },
    {
      icon: '🏷️',
      title: '자동 태깅',
      description: '메모 내용을 분석하여 관련 태그를 자동으로 생성하여 정리를 도와드립니다'
    },
    {
      icon: '🔍',
      title: '스마트 검색',
      description: '태그, 제목, 내용을 통합하여 원하는 메모를 빠르게 찾을 수 있습니다'
    }
  ]

  return (
    <div className={`space-y-8 ${isPopup ? 'space-y-4 pb-4' : ''}`}>
      {/* 환영 메시지 */}
      <div className="text-center">
        <div className={`mb-4 ${isPopup ? 'text-4xl' : 'text-6xl'}`}>🌟</div>
        <h2 className={`font-bold bg-gradient-to-r from-emerald-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent mb-4 ${isPopup ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'}`}>
          AI 메모장에 오신 것을 환영합니다!
        </h2>
        <p className={`text-gray-700 max-w-2xl mx-auto ${isPopup ? 'text-sm' : 'text-lg'}`}>
          AI 메모장은 음성 인식과 인공지능을 활용하여 더욱 스마트하고 효율적인 메모 작성 경험을 제공합니다.
        </p>
      </div>

      {/* 주요 기능 소개 */}
      <div className={`grid gap-6 ${isPopup ? 'grid-cols-2 gap-4' : 'grid-cols-1 md:grid-cols-2'}`}>
        {features.map((feature, index) => (
          <Card
            key={index}
            className={`bg-gradient-to-br from-white to-gray-50 border-purple-200 hover:shadow-lg transition-all duration-300 ${isPopup ? 'hover:scale-102' : 'hover:scale-105'}`}
          >
            <CardContent className={`${isPopup ? 'p-3' : 'p-6'}`}>
              <div className="flex items-start space-x-3">
                <div className={`${isPopup ? 'text-xl' : 'text-3xl'}`}>{feature.icon}</div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-1 bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent ${isPopup ? 'text-sm' : 'text-xl'}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-gray-700 leading-relaxed ${isPopup ? 'text-xs' : ''}`}>
                    {feature.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 추가 정보 */}
      {isPopup ? (
        <div className="bg-gradient-to-r from-emerald-50 to-violet-50 rounded-lg p-4 border border-emerald-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="text-xl">💡</div>
            <h3 className="text-base font-semibold text-gray-800">시작하기 전에</h3>
          </div>
          <ul className="space-y-1 text-sm text-gray-700">
            <li className="flex items-center space-x-2">
              <span className="text-emerald-500">✓</span>
              <span>마이크 권한을 허용하면 음성 메모 기능을 사용할 수 있습니다</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-emerald-500">✓</span>
              <span>모든 데이터는 안전하게 암호화되어 저장됩니다</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-emerald-500">✓</span>
              <span>언제든지 온보딩을 건너뛰고 바로 시작할 수 있습니다</span>
            </li>
          </ul>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-50 to-violet-50 rounded-lg p-6 border border-emerald-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">💡</div>
            <h3 className="text-lg font-semibold text-gray-800">시작하기 전에</h3>
          </div>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center space-x-2">
              <span className="text-emerald-500">✓</span>
              <span>마이크 권한을 허용하면 음성 메모 기능을 사용할 수 있습니다</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-emerald-500">✓</span>
              <span>모든 데이터는 안전하게 암호화되어 저장됩니다</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="text-emerald-500">✓</span>
              <span>언제든지 온보딩을 건너뛰고 바로 시작할 수 있습니다</span>
            </li>
          </ul>
        </div>
      )}

      {/* 다음 단계 안내 */}
      <div className="text-center">
        <p className={`text-gray-600 ${isPopup ? 'text-sm' : ''}`}>
          다음 단계에서는 실제로 메모를 작성하는 방법을 알아보겠습니다! 🚀
        </p>
      </div>

      {/* 팝업에서만 표시되는 추가 콘텐츠 */}
      {isPopup && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-1">💡 팁</h4>
            <p className="text-xs text-blue-700">
              온보딩을 완료하면 AI 메모장의 모든 기능을 자유롭게 사용할 수 있습니다.
            </p>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
            <h4 className="text-sm font-semibold text-green-800 mb-1">🎯 목표</h4>
            <p className="text-xs text-green-700">
              더 효율적이고 스마트한 메모 작성 경험을 제공하는 것이 저희의 목표입니다.
            </p>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
            <h4 className="text-sm font-semibold text-purple-800 mb-1">🚀 시작하기</h4>
            <p className="text-xs text-purple-700">
              몇 가지 간단한 단계를 통해 AI 메모장의 강력한 기능들을 체험해보세요.
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 border border-yellow-200">
            <h4 className="text-sm font-semibold text-yellow-800 mb-1">⭐ 특징</h4>
            <ul className="text-xs text-yellow-700 space-y-0.5">
              <li>• 실시간 음성 인식</li>
              <li>• AI 자동 요약</li>
              <li>• 스마트 태깅</li>
              <li>• 빠른 검색</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg p-3 border border-cyan-200 col-span-2">
            <h4 className="text-sm font-semibold text-cyan-800 mb-1">🔒 보안</h4>
            <p className="text-xs text-cyan-700">
              모든 데이터는 안전하게 암호화되어 저장되며, 개인정보 보호를 최우선으로 합니다.
            </p>
          </div>

          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3 border border-indigo-200">
            <h4 className="text-sm font-semibold text-indigo-800 mb-1">📱 모바일 지원</h4>
            <p className="text-xs text-indigo-700">
              반응형 디자인으로 모바일과 태블릿에서도 완벽하게 작동합니다.
            </p>
          </div>

          <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-200">
            <h4 className="text-sm font-semibold text-emerald-800 mb-1">⚡ 빠른 성능</h4>
            <p className="text-xs text-emerald-700">
              최적화된 코드로 빠르고 부드러운 사용자 경험을 제공합니다.
            </p>
          </div>

          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-3 border border-rose-200">
            <h4 className="text-sm font-semibold text-rose-800 mb-1">🎨 아름다운 UI</h4>
            <p className="text-xs text-rose-700">
              직관적이고 아름다운 인터페이스로 사용하기 편리합니다.
            </p>
          </div>

          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-3 border border-amber-200">
            <h4 className="text-sm font-semibold text-amber-800 mb-1">🔄 실시간 동기화</h4>
            <p className="text-xs text-amber-700">
              모든 기기에서 실시간으로 메모가 동기화됩니다.
            </p>
          </div>

          <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-lg p-3 border border-slate-200 col-span-2">
            <h4 className="text-sm font-semibold text-slate-800 mb-1">🚀 시작하기</h4>
            <p className="text-xs text-slate-700">
              지금 바로 AI 메모장의 강력한 기능들을 체험해보세요. 몇 가지 간단한 단계만 거치면 됩니다!
            </p>
          </div>

          <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-lg p-3 border border-violet-200">
            <h4 className="text-sm font-semibold text-violet-800 mb-1">🎯 목표 달성</h4>
            <p className="text-xs text-violet-700">
              효율적인 메모 관리를 통해 생산성을 극대화하세요.
            </p>
          </div>

          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-3 border border-teal-200">
            <h4 className="text-sm font-semibold text-teal-800 mb-1">💎 프리미엄</h4>
            <p className="text-xs text-teal-700">
              고급 AI 기능과 무제한 저장 공간을 제공합니다.
            </p>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
            <h4 className="text-sm font-semibold text-orange-800 mb-1">🔥 인기 기능</h4>
            <p className="text-xs text-orange-700">
              사용자들이 가장 사랑하는 기능들을 확인해보세요.
            </p>
          </div>

          <div className="bg-gradient-to-r from-lime-50 to-green-50 rounded-lg p-3 border border-lime-200 col-span-2">
            <h4 className="text-sm font-semibold text-lime-800 mb-1">🌟 완벽한 경험</h4>
            <p className="text-xs text-lime-700">
              AI 메모장과 함께 더 스마트하고 효율적인 메모 작성의 새로운 경험을 시작하세요!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
