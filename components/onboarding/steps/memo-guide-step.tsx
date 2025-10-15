// components/onboarding/steps/memo-guide-step.tsx
// 온보딩 두 번째 단계 - 첫 메모 작성 가이드
// 메모 작성 인터페이스와 방법을 안내하는 컴포넌트
// 관련 파일: components/onboarding/onboarding-container.tsx

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function MemoGuideStep() {
  const [demoTitle, setDemoTitle] = useState('')
  const [demoContent, setDemoContent] = useState('')

  const steps = [
    {
      number: 1,
      title: '제목 입력',
      description: '메모의 제목을 입력하세요. 간단하고 명확한 제목이 좋습니다.',
      example: '예: 오늘의 회의 내용'
    },
    {
      number: 2,
      title: '내용 작성',
      description: '메모의 내용을 자유롭게 작성하세요. 텍스트나 음성으로 입력할 수 있습니다.',
      example: '예: 프로젝트 일정 논의, 다음 주까지 완료해야 할 작업들...'
    },
    {
      number: 3,
      title: '자동 저장',
      description: '작성한 내용은 자동으로 저장되며, 언제든지 수정할 수 있습니다.',
      example: '실시간으로 클라우드에 안전하게 저장됩니다'
    }
  ]

  return (
    <div className="space-y-8">
      {/* 단계 안내 */}
      <div className="text-center">
        <div className="text-6xl mb-4">📝</div>
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent mb-4">
          메모 작성 방법 알아보기
        </h2>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          간단한 3단계로 메모를 작성하는 방법을 알아보겠습니다
        </p>
      </div>

      {/* 단계별 가이드 */}
      <div className="space-y-6">
        {steps.map((step, index) => (
          <Card
            key={index}
            className="bg-gradient-to-br from-white to-gray-50 border-purple-200 hover:shadow-lg transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-violet-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent">
                    {step.title}
                  </h3>
                  <p className="text-gray-700 mb-2">{step.description}</p>
                  <p className="text-sm text-gray-500 italic">{step.example}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 실제 체험해보기 */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="text-2xl">✍️</div>
          <h3 className="text-lg font-semibold text-gray-800">직접 체험해보세요!</h3>
        </div>
        <p className="text-gray-700 mb-6">
          아래에서 실제 메모 작성 인터페이스를 체험해보세요. 실제로는 자동 저장되지만, 여기서는 데모용입니다.
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="demo-title" className="text-sm font-medium text-gray-700">
              메모 제목
            </Label>
            <Input
              id="demo-title"
              type="text"
              placeholder="예: 오늘의 회의 내용"
              value={demoTitle}
              onChange={(e) => setDemoTitle(e.target.value)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="demo-content" className="text-sm font-medium text-gray-700">
              메모 내용
            </Label>
            <textarea
              id="demo-content"
              placeholder="예: 프로젝트 일정 논의, 다음 주까지 완료해야 할 작업들..."
              value={demoContent}
              onChange={(e) => setDemoContent(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              rows={4}
            />
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>자동 저장됨</span>
          </div>
        </div>
      </div>

      {/* 음성 메모 안내 */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="text-2xl">🎤</div>
          <h3 className="text-lg font-semibold text-gray-800">음성 메모 기능</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">음성 입력 방법:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• 마이크 버튼을 클릭하여 음성 녹음 시작</li>
              <li>• 말하기를 완료하면 자동으로 텍스트 변환</li>
              <li>• 실시간으로 변환된 텍스트 확인 가능</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">팁:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• 조용한 환경에서 사용하면 정확도가 높아집니다</li>
              <li>• 명확하고 천천히 말하면 더 좋은 결과를 얻을 수 있습니다</li>
              <li>• 변환된 텍스트는 언제든지 수정할 수 있습니다</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 다음 단계 안내 */}
      <div className="text-center">
        <p className="text-gray-600">
          다음 단계에서는 AI가 어떻게 메모를 요약하고 태그를 생성하는지 살펴보겠습니다! 🤖
        </p>
      </div>
    </div>
  )
}
