// components/onboarding/steps/ai-demo-step.tsx
// 온보딩 세 번째 단계 - AI 기능 시연
// AI 요약 및 태깅 기능을 시연하는 컴포넌트
// 관련 파일: components/onboarding/onboarding-container.tsx

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AIDemoStep() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [showTags, setShowTags] = useState(false)

  // 시연용 샘플 데이터
  const sampleMemo = {
    title: "프로젝트 회의 내용",
    content: `오늘 오후 2시에 진행된 프로젝트 회의에서 다음과 같은 내용을 논의했습니다.

주요 안건:
1. 다음 주까지 완료해야 할 작업들
   - 사용자 인증 시스템 구현
   - 데이터베이스 스키마 설계
   - API 엔드포인트 개발

2. 팀원 역할 분담
   - 프론트엔드: 김개발, 이코딩
   - 백엔드: 박서버, 최데이터
   - 디자인: 정UI, 한UX

3. 일정 조정
   - 원래 계획보다 1주일 연장 필요
   - 클라이언트와 추가 미팅 일정 조율

4. 기술적 이슈
   - 인증 시스템에서 OAuth 2.0 구현 필요
   - 데이터베이스 성능 최적화 검토
   - 모바일 반응형 디자인 개선

다음 회의는 금요일 오후 3시에 예정되어 있습니다.`
  }

  const sampleSummary = "프로젝트 회의에서 다음 주까지 완료할 작업들(사용자 인증, DB 스키마, API 개발)과 팀원 역할 분담, 일정 연장, 기술적 이슈(OAuth 2.0, DB 성능, 모바일 반응형)를 논의했습니다. 다음 회의는 금요일 오후 3시입니다."

  const sampleTags = ["회의", "프로젝트", "일정", "팀워크", "기술", "OAuth", "데이터베이스", "API", "모바일"]

  // AI 처리 시뮬레이션
  const simulateAIProcessing = () => {
    setIsProcessing(true)
    setShowSummary(false)
    setShowTags(false)

    // 요약 처리 시뮬레이션
    setTimeout(() => {
      setShowSummary(true)
    }, 2000)

    // 태그 생성 시뮬레이션
    setTimeout(() => {
      setShowTags(true)
      setIsProcessing(false)
    }, 3500)
  }

  return (
    <div className="space-y-8">
      {/* AI 기능 소개 */}
      <div className="text-center">
        <div className="text-6xl mb-4">🤖</div>
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent mb-4">
          AI의 강력한 기능 체험하기
        </h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          AI가 메모를 분석하여 자동으로 요약과 태그를 생성하는 과정을 살펴보세요
        </p>
      </div>

      {/* 원본 메모 표시 */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">📄</div>
            <h3 className="text-lg font-semibold text-gray-800">원본 메모</h3>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">{sampleMemo.title}</h4>
              <div className="bg-gray-50 p-4 rounded-lg border text-sm text-gray-700 whitespace-pre-line max-h-60 overflow-y-auto">
                {sampleMemo.content}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI 처리 버튼 */}
      <div className="text-center">
        <Button
          onClick={simulateAIProcessing}
          disabled={isProcessing}
          className="bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white border-0 shadow-lg px-8 py-3 text-lg"
        >
          {isProcessing ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>AI가 분석 중...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>🤖</span>
              <span>AI 분석 시작하기</span>
            </div>
          )}
        </Button>
      </div>

      {/* AI 요약 결과 */}
      <Card className={`bg-gradient-to-br from-white to-gray-50 border-purple-200 transition-all duration-500 ${showSummary ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">📝</div>
            <h3 className="text-lg font-semibold text-gray-800">AI 요약</h3>
            <div className="flex items-center space-x-2 text-sm text-emerald-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>완료</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-emerald-50 to-violet-50 p-4 rounded-lg border border-emerald-200">
            <p className="text-gray-700 leading-relaxed">{sampleSummary}</p>
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <span className="font-medium">요약 길이:</span> 원본의 약 20%로 압축
          </div>
        </CardContent>
      </Card>

      {/* AI 태그 생성 결과 */}
      <Card className={`bg-gradient-to-br from-white to-gray-50 border-purple-200 transition-all duration-500 ${showTags ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="text-2xl">🏷️</div>
            <h3 className="text-lg font-semibold text-gray-800">자동 생성 태그</h3>
            <div className="flex items-center space-x-2 text-sm text-emerald-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span>완료</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {sampleTags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-emerald-100 to-violet-100 text-gray-800 border border-emerald-200 hover:shadow-md transition-all duration-200"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: showTags ? 'fadeInUp 0.5s ease-out forwards' : 'none'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <span className="font-medium">총 {sampleTags.length}개의 태그</span>가 자동으로 생성되었습니다
          </div>
        </CardContent>
      </Card>

      {/* AI 기능 설명 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-2xl">🧠</div>
              <h3 className="text-lg font-semibold text-gray-800">AI 요약 기능</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• 핵심 내용을 자동으로 추출하여 요약</li>
              <li>• 원본의 10-30% 길이로 압축</li>
              <li>• 중요한 정보는 누락하지 않도록 보장</li>
              <li>• 한국어 자연어 처리 최적화</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-2xl">🔍</div>
              <h3 className="text-lg font-semibold text-gray-800">자동 태깅 기능</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• 메모 내용에서 키워드 자동 추출</li>
              <li>• 관련성 높은 태그 우선 생성</li>
              <li>• 검색 및 분류에 최적화</li>
              <li>• 사용자 맞춤형 태그 학습</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* 완료 안내 */}
      <div className="text-center bg-gradient-to-r from-emerald-50 to-violet-50 rounded-lg p-6 border border-emerald-200">
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">온보딩이 거의 완료되었습니다!</h3>
        <p className="text-gray-700">
          이제 AI 메모장의 모든 주요 기능을 이해하셨습니다. 실제 메모를 작성하고 AI의 도움을 받아보세요!
        </p>
      </div>
    </div>
  )
}
