// components/admin/error-monitoring-dashboard.tsx
// 에러 모니터링 대시보드 컴포넌트
// AI 처리 에러 통계 및 패턴 분석을 시각화하여 제공

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';
import { getErrorStats, getErrorPatterns } from '@/lib/utils/error-monitoring';
import type { ErrorStats, ErrorLogEntry } from '@/lib/utils/error-monitoring';

interface ErrorMonitoringDashboardProps {
  className?: string;
}

export function ErrorMonitoringDashboard({ className = '' }: ErrorMonitoringDashboardProps) {
  const [stats, setStats] = useState<ErrorStats | null>(null);
  const [patterns, setPatterns] = useState<{
    mostCommonErrorType: string;
    mostCommonAction: string;
    errorTrend: 'increasing' | 'decreasing' | 'stable';
    recommendations: string[];
  } | null>(null);
  const [recentErrors, setRecentErrors] = useState<ErrorLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, patternsData] = await Promise.all([
        Promise.resolve(getErrorStats()),
        Promise.resolve(getErrorPatterns())
      ]);
      
      setStats(statsData);
      setPatterns(patternsData);
      setRecentErrors(statsData.recentErrors);
    } catch (error) {
      console.error('Failed to load error monitoring data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // 30초마다 데이터 새로고침
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-red-600';
      case 'decreasing':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(timestamp);
  };

  if (isLoading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">에러 모니터링 데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          에러 모니터링 데이터를 불러올 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">에러 모니터링 대시보드</h2>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          새로고침
        </Button>
      </div>

      {/* 통계 카드들 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 에러 수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalErrors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">재시도 성공률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.retrySuccessRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">평균 재시도 횟수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.averageRetryAttempts.toFixed(1)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">에러 트렌드</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {patterns && getTrendIcon(patterns.errorTrend)}
              <span className={`ml-2 text-sm font-medium ${patterns ? getTrendColor(patterns.errorTrend) : 'text-gray-600'}`}>
                {patterns?.errorTrend || 'stable'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 에러 타입별 통계 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            에러 타입별 통계
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.errorsByType)
              .sort(([,a], [,b]) => b - a)
              .map(([errorType, count]) => (
                <div key={errorType} className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {errorType}
                  </Badge>
                  <span className="text-sm font-medium">{count}회</span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* 액션별 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>액션별 에러 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(stats.errorsByAction)
              .sort(([,a], [,b]) => b - a)
              .map(([action, count]) => (
                <div key={action} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{action}</span>
                  <Badge variant="secondary">{count}회</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* 권장사항 */}
      {patterns && patterns.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>권장사항</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patterns.recommendations.map((recommendation: string, index: number) => (
                <div key={index} className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-yellow-800">{recommendation}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 최근 에러 로그 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 에러 로그</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentErrors.length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                최근 에러가 없습니다.
              </div>
            ) : (
              recentErrors.map((error) => (
                <div key={error.id} className="p-3 border border-gray-200 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {error.errorType}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(error.timestamp)}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {error.action}
                  </div>
                  <div className="text-sm text-gray-600">
                    {error.userMessage}
                  </div>
                  {error.retryCount !== undefined && (
                    <div className="text-xs text-blue-600 mt-1">
                      재시도: {error.retryCount}회
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
