// components/ai-memo-summary-popup.tsx
// AI 메모장 요약 팝업 컴포넌트
// AI 메모장의 주요 기능을 간단하게 요약해서 보여주는 팝업
// 기존 긴 온보딩 대신 핵심 기능만 간단히 소개

'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, Brain, Tag, FileText, Zap, Search } from 'lucide-react';

interface AIMemoSummaryPopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AIMemoSummaryPopup({ open, onOpenChange }: AIMemoSummaryPopupProps) {
  const [showDetails, setShowDetails] = useState(false);

  const handleClose = () => {
    setShowDetails(false);
    onOpenChange(false);
  };

  const handleShowDetails = () => {
    setShowDetails(true);
  };

  const features = [
    {
      icon: <Mic className="w-6 h-6 text-emerald-600" />,
      title: "음성 인식",
      description: "음성을 실시간으로 텍스트로 변환",
      detail: "마이크를 통해 말하는 내용이 자동으로 텍스트로 변환되어 빠르게 메모할 수 있습니다."
    },
    {
      icon: <Brain className="w-6 h-6 text-violet-600" />,
      title: "AI 요약",
      description: "메모 내용을 AI가 자동으로 요약",
      detail: "긴 메모 내용을 핵심 포인트로 요약하여 중요한 정보를 빠르게 파악할 수 있습니다."
    },
    {
      icon: <Tag className="w-6 h-6 text-cyan-600" />,
      title: "자동 태깅",
      description: "관련 태그를 자동으로 생성",
      detail: "메모 내용을 분석하여 관련 태그를 자동으로 생성하여 나중에 쉽게 찾을 수 있습니다."
    },
    {
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      title: "노트 관리",
      description: "체계적인 노트 정리 및 관리",
      detail: "노트를 생성, 수정, 삭제하고 정렬하여 체계적으로 관리할 수 있습니다."
    },
    {
      icon: <Zap className="w-6 h-6 text-orange-600" />,
      title: "실시간 저장",
      description: "작성 중 자동으로 저장",
      detail: "작성 중인 내용이 실시간으로 자동 저장되어 데이터 손실을 방지합니다."
    },
    {
      icon: <Search className="w-6 h-6 text-purple-600" />,
      title: "검색 & 필터",
      description: "빠른 검색 및 필터링",
      detail: "제목, 내용, 태그로 검색하고 다양한 기준으로 필터링할 수 있습니다."
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 bg-transparent border-0">
        <DialogTitle className="sr-only">AI 메모장 기능 요약</DialogTitle>
        <div className="relative w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* 닫기 버튼 */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            aria-label="팝업 닫기"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="h-full overflow-y-auto">
            {/* 헤더 */}
            <div className="bg-gradient-to-r from-emerald-500 via-violet-500 to-cyan-500 p-6 text-white">
              <div className="text-center">
                <div className="text-4xl mb-3">🤖</div>
                <h2 className="text-2xl font-bold mb-2">AI 메모장</h2>
                <p className="text-emerald-100">음성 인식과 AI로 더 스마트한 메모 관리</p>
              </div>
            </div>

            {/* 메인 콘텐츠 */}
            <div className="p-6">
              {!showDetails ? (
                // 간단한 요약 뷰
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">주요 기능</h3>
                    <p className="text-gray-600 mb-6">AI 메모장의 핵심 기능들을 확인해보세요</p>
                  </div>

                  {/* 기능 카드 그리드 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map((feature, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow border-gray-200">
                        <CardContent className="p-4 text-center">
                          <div className="flex justify-center mb-3">
                            {feature.icon}
                          </div>
                          <h4 className="font-semibold text-gray-800 mb-2">{feature.title}</h4>
                          <p className="text-sm text-gray-600">{feature.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={handleShowDetails}
                      className="bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white"
                    >
                      자세히 보기
                    </Button>
                    <Button
                      onClick={handleClose}
                      variant="outline"
                    >
                      바로 시작하기
                    </Button>
                  </div>
                </div>
              ) : (
                // 상세 정보 뷰
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">기능 상세 설명</h3>
                    <p className="text-gray-600 mb-6">각 기능의 자세한 내용을 확인해보세요</p>
                  </div>

                  {/* 상세 기능 설명 */}
                  <div className="space-y-4">
                    {features.map((feature, index) => (
                      <Card key={index} className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 mt-1">
                              {feature.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800 mb-2">{feature.title}</h4>
                              <p className="text-gray-600 text-sm">{feature.detail}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      onClick={() => setShowDetails(false)}
                      variant="outline"
                    >
                      요약으로 돌아가기
                    </Button>
                    <Button
                      onClick={handleClose}
                      className="bg-gradient-to-r from-emerald-500 to-violet-600 hover:from-emerald-600 hover:to-violet-700 text-white"
                    >
                      시작하기
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
