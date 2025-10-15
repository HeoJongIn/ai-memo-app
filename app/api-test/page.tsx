// app/api-test/page.tsx
// Gemini 모델 성능 테스트 페이지
// 개발자가 Gemini API 연결 및 다양한 모델 성능 테스트를 할 수 있는 페이지
// 관련 파일: lib/actions/ai.ts, components/ui/button.tsx, components/ui/textarea.tsx

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  testGeminiConnectionAction,
} from '@/lib/actions/ai';

export default function GeminiModelTestPage() {
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [testPrompt, setTestPrompt] = useState('');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [selectedTest, setSelectedTest] = useState<string>('creative');
  const [loading, setLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const testCases = [
    {
      id: 'creative',
      name: '창의적 글쓰기',
      description: '창의적이고 상상력이 풍부한 글쓰기 능력 테스트',
      prompt: '미래의 도시에서 로봇과 인간이 함께 살아가는 모습을 상상해서 짧은 이야기를 써주세요.'
    },
    {
      id: 'reasoning',
      name: '논리적 추론',
      description: '복잡한 문제 해결 및 논리적 사고 능력 테스트',
      prompt: '다음 문제를 단계별로 해결해주세요: A, B, C 세 사람이 있습니다. A는 항상 거짓말을 하고, B는 항상 진실을 말하며, C는 때로는 진실을 때로는 거짓을 말합니다. 이들이 "우리 중 한 명은 거짓말쟁이입니다"라고 말했습니다. 각각이 어떤 사람인지 추론해주세요.'
    },
    {
      id: 'coding',
      name: '코딩 능력',
      description: '프로그래밍 문제 해결 및 코드 작성 능력 테스트',
      prompt: 'JavaScript로 피보나치 수열의 n번째 항을 구하는 함수를 작성해주세요. 재귀와 반복문 두 가지 방법으로 모두 작성해주세요.'
    },
    {
      id: 'translation',
      name: '번역 능력',
      description: '다국어 번역 및 언어 이해 능력 테스트',
      prompt: '다음 영어 문장을 자연스러운 한국어로 번역해주세요: "The quick brown fox jumps over the lazy dog. This sentence contains every letter of the alphabet and is commonly used for typing practice."'
    },
    {
      id: 'analysis',
      name: '데이터 분석',
      description: '데이터 해석 및 분석 능력 테스트',
      prompt: '다음 데이터를 분석하고 인사이트를 도출해주세요: 2023년 온라인 쇼핑몰 매출이 전년 대비 15% 증가했고, 모바일 주문이 전체 주문의 70%를 차지했습니다. 또한 20-30대 고객이 전체 고객의 45%를 차지하며, 이들의 평균 구매 금액이 전체 평균보다 20% 높습니다.'
    },
    {
      id: 'custom',
      name: '사용자 정의',
      description: '직접 프롬프트를 입력하여 테스트',
      prompt: ''
    }
  ];

  const handleConnectionTest = async () => {
    setLoading(true);
    setConnectionStatus(null);
    try {
      const result = await testGeminiConnectionAction();
      if (result.success) {
        setConnectionStatus(`✅ API 연결 성공: ${result.data?.message}`);
      } else {
        setConnectionStatus(`❌ API 연결 실패: ${result.error}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      setConnectionStatus(`❌ 오류 발생: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleModelTest = async () => {
    setLoading(true);
    setTestResult(null);
    setResponseTime(null);
    
    const startTime = Date.now();
    
    try {
      const selectedTestCase = testCases.find(test => test.id === selectedTest);
      const promptToUse = selectedTest === 'custom' ? testPrompt : selectedTestCase?.prompt || testPrompt;
      
      if (!promptToUse.trim()) {
        setTestResult('❌ 테스트할 프롬프트를 입력해주세요.');
        return;
      }

      const response = await fetch('/api/gemini-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'model-test',
          prompt: promptToUse,
          testType: selectedTest,
        }),
      });

      const result = await response.json();
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      
      if (result.success) {
        setTestResult(`✅ 모델 테스트 성공 (응답시간: ${responseTime}ms):\n\n${result.data}`);
      } else {
        setTestResult(`❌ 모델 테스트 실패: ${result.error}`);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      setTestResult(`❌ 오류 발생: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTestCaseSelect = (testId: string) => {
    setSelectedTest(testId);
    const selectedTestCase = testCases.find(test => test.id === testId);
    if (selectedTestCase && testId !== 'custom') {
      setTestPrompt(selectedTestCase.prompt);
    } else if (testId === 'custom') {
      setTestPrompt('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Gemini 모델 성능 테스트
          </h1>
          <p className="text-gray-600 text-lg">
            Google Gemini API 연결 및 다양한 모델 성능 테스트 페이지
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          {/* API 연결 테스트 */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔗 API 연결 테스트
              </CardTitle>
              <CardDescription>
                Gemini API 서버와의 연결 상태를 확인합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleConnectionTest} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
              >
                {loading ? '🔄 테스트 중...' : '🚀 API 연결 테스트'}
              </Button>
              {connectionStatus && (
                <div className={`p-3 rounded-lg text-sm font-medium ${
                  connectionStatus.includes('성공') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {connectionStatus}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 테스트 케이스 선택 */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧪 테스트 케이스 선택
              </CardTitle>
              <CardDescription>
                다양한 모델 성능 테스트 케이스를 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {testCases.map((testCase) => (
                <div key={testCase.id} className="space-y-2">
                  <Button
                    variant={selectedTest === testCase.id ? "default" : "outline"}
                    onClick={() => handleTestCaseSelect(testCase.id)}
                    className={`w-full text-left justify-start ${
                      selectedTest === testCase.id 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                        : 'hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{testCase.name}</span>
                      <span className="text-xs opacity-75">{testCase.description}</span>
                    </div>
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 모델 성능 테스트 */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ⚡ 모델 성능 테스트
              </CardTitle>
              <CardDescription>
                선택한 테스트 케이스로 모델 성능을 측정합니다
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="테스트할 프롬프트를 입력하거나 위에서 테스트 케이스를 선택하세요"
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                className="min-h-[120px]"
              />
              <Button 
                onClick={handleModelTest} 
                disabled={loading || !testPrompt.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
              >
                {loading ? '🔄 테스트 중...' : '🚀 모델 성능 테스트'}
              </Button>
              {responseTime && (
                <div className="text-center text-sm text-gray-600">
                  응답 시간: {responseTime}ms
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 테스트 결과 */}
        {testResult && (
          <Card className="mt-6 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 테스트 결과
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg text-sm font-medium whitespace-pre-wrap ${
                testResult.includes('성공') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {testResult}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 성능 지표 */}
        <Card className="mt-6 shadow-lg bg-gradient-to-r from-gray-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📈 성능 지표
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-blue-600">응답시간</div>
                <div className="text-sm text-gray-600">API 호출부터 응답까지의 시간</div>
                <div className="text-lg font-semibold mt-2">
                  {responseTime ? `${responseTime}ms` : '-'}
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-green-600">연결 상태</div>
                <div className="text-sm text-gray-600">API 서버 연결 상태</div>
                <div className="text-lg font-semibold mt-2">
                  {connectionStatus?.includes('성공') ? '✅ 정상' : '❌ 오류'}
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-purple-600">테스트 타입</div>
                <div className="text-sm text-gray-600">현재 선택된 테스트</div>
                <div className="text-lg font-semibold mt-2">
                  {testCases.find(t => t.id === selectedTest)?.name || '-'}
                </div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-2xl font-bold text-orange-600">모델 버전</div>
                <div className="text-sm text-gray-600">사용 중인 Gemini 모델</div>
                <div className="text-lg font-semibold mt-2">2.0-flash</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 사용 안내 */}
        <Card className="mt-6 shadow-lg bg-gradient-to-r from-gray-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              💡 사용 안내
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">1. API 연결 확인</h4>
                <p className="text-sm text-gray-600">
                  먼저 Gemini API 연결 상태를 확인하세요. 환경 변수 GEMINI_API_KEY가 올바르게 설정되어 있는지 확인됩니다.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">2. 테스트 케이스 선택</h4>
                <p className="text-sm text-gray-600">
                  다양한 성능 테스트 케이스 중 하나를 선택하거나 사용자 정의 프롬프트를 입력할 수 있습니다.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-600">3. 성능 측정</h4>
                <p className="text-sm text-gray-600">
                  응답 시간과 결과 품질을 통해 모델의 성능을 종합적으로 평가할 수 있습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
