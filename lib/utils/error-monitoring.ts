// lib/utils/error-monitoring.ts
// 에러 모니터링 및 통계 수집 시스템
// AI 처리 에러의 패턴 분석 및 모니터링 기능 제공

export interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<string, number>;
  errorsByAction: Record<string, number>;
  recentErrors: ErrorLogEntry[];
  retrySuccessRate: number;
  averageRetryAttempts: number;
}

export interface ErrorLogEntry {
  id: string;
  timestamp: Date;
  errorType: string;
  action: string;
  message: string;
  userMessage: string;
  retryable: boolean;
  retryCount?: number;
  success?: boolean;
  context?: unknown;
}

export interface MonitoringConfig {
  maxLogEntries: number;
  statsRetentionDays: number;
  enableDetailedLogging: boolean;
}

// 기본 설정
const DEFAULT_CONFIG: MonitoringConfig = {
  maxLogEntries: 1000,
  statsRetentionDays: 30,
  enableDetailedLogging: true
};

// 메모리 기반 저장소 (실제 프로덕션에서는 Redis나 DB 사용 권장)
const errorLogs: ErrorLogEntry[] = [];
const errorStats: ErrorStats = {
  totalErrors: 0,
  errorsByType: {},
  errorsByAction: {},
  recentErrors: [],
  retrySuccessRate: 0,
  averageRetryAttempts: 0
};

export class ErrorMonitor {
  private config: MonitoringConfig;

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // 에러 로그 추가
  logError(errorInfo: {
    type: string;
    message: string;
    userMessage: string;
    retryable: boolean;
    details?: unknown;
  }, context: {
    action: string;
    retryCount?: number;
    success?: boolean;
    [key: string]: unknown;
  }): string {
    const logEntry: ErrorLogEntry = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      errorType: errorInfo.type,
      action: context.action,
      message: errorInfo.message,
      userMessage: errorInfo.userMessage,
      retryable: errorInfo.retryable,
      retryCount: context.retryCount,
      success: context.success,
      context: this.config.enableDetailedLogging ? context : undefined
    };

    // 로그 추가
    errorLogs.push(logEntry);

    // 최대 로그 수 제한
    if (errorLogs.length > this.config.maxLogEntries) {
      errorLogs.splice(0, errorLogs.length - this.config.maxLogEntries);
    }

    // 통계 업데이트
    this.updateStats(logEntry);

    // 만료된 로그 정리
    this.cleanupExpiredLogs();

    console.log('Error logged:', logEntry);
    return logEntry.id;
  }

  // 통계 업데이트
  private updateStats(entry: ErrorLogEntry): void {
    errorStats.totalErrors++;

    // 에러 타입별 통계
    errorStats.errorsByType[entry.errorType] = 
      (errorStats.errorsByType[entry.errorType] || 0) + 1;

    // 액션별 통계
    errorStats.errorsByAction[entry.action] = 
      (errorStats.errorsByAction[entry.action] || 0) + 1;

    // 최근 에러 업데이트
    errorStats.recentErrors = errorLogs
      .slice(-10) // 최근 10개
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // 재시도 성공률 계산
    const retryErrors = errorLogs.filter(log => log.retryCount !== undefined);
    if (retryErrors.length > 0) {
      const successfulRetries = retryErrors.filter(log => log.success === true).length;
      errorStats.retrySuccessRate = (successfulRetries / retryErrors.length) * 100;
    }

    // 평균 재시도 횟수 계산
    const retryCounts = retryErrors.map(log => log.retryCount || 0);
    if (retryCounts.length > 0) {
      errorStats.averageRetryAttempts = 
        retryCounts.reduce((sum, count) => sum + count, 0) / retryCounts.length;
    }
  }

  // 만료된 로그 정리
  private cleanupExpiredLogs(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.statsRetentionDays);

    const initialLength = errorLogs.length;
    const filteredLogs = errorLogs.filter(log => log.timestamp >= cutoffDate);
    
    if (filteredLogs.length !== initialLength) {
      errorLogs.splice(0, errorLogs.length, ...filteredLogs);
      console.log(`Cleaned up ${initialLength - filteredLogs.length} expired error logs`);
    }
  }

  // 통계 조회
  getStats(): ErrorStats {
    return { ...errorStats };
  }

  // 특정 기간의 에러 로그 조회
  getErrorLogs(
    startDate?: Date, 
    endDate?: Date, 
    errorType?: string,
    action?: string
  ): ErrorLogEntry[] {
    let filteredLogs = [...errorLogs];

    if (startDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp >= startDate);
    }

    if (endDate) {
      filteredLogs = filteredLogs.filter(log => log.timestamp <= endDate);
    }

    if (errorType) {
      filteredLogs = filteredLogs.filter(log => log.errorType === errorType);
    }

    if (action) {
      filteredLogs = filteredLogs.filter(log => log.action === action);
    }

    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // 에러 패턴 분석
  analyzeErrorPatterns(): {
    mostCommonErrorType: string;
    mostCommonAction: string;
    errorTrend: 'increasing' | 'decreasing' | 'stable';
    recommendations: string[];
  } {
    const stats = this.getStats();
    
    // 가장 흔한 에러 타입
    const mostCommonErrorType = Object.entries(stats.errorsByType)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'UNKNOWN';

    // 가장 흔한 액션
    const mostCommonAction = Object.entries(stats.errorsByAction)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'UNKNOWN';

    // 에러 트렌드 분석 (최근 1시간 vs 이전 1시간)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    const recentErrors = this.getErrorLogs(oneHourAgo, now);
    const previousErrors = this.getErrorLogs(twoHoursAgo, oneHourAgo);

    let errorTrend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentErrors.length > previousErrors.length * 1.2) {
      errorTrend = 'increasing';
    } else if (recentErrors.length < previousErrors.length * 0.8) {
      errorTrend = 'decreasing';
    }

    // 권장사항 생성
    const recommendations: string[] = [];
    
    if (stats.retrySuccessRate < 50) {
      recommendations.push('재시도 성공률이 낮습니다. 재시도 로직을 검토해주세요.');
    }
    
    if (stats.averageRetryAttempts > 2) {
      recommendations.push('평균 재시도 횟수가 높습니다. 네트워크 안정성을 확인해주세요.');
    }
    
    if (mostCommonErrorType === 'NETWORK_ERROR') {
      recommendations.push('네트워크 에러가 빈번합니다. 연결 상태를 확인해주세요.');
    }
    
    if (mostCommonErrorType === 'TOKEN_LIMIT_EXCEEDED') {
      recommendations.push('토큰 제한 초과가 빈번합니다. 입력 텍스트 길이를 제한해주세요.');
    }

    return {
      mostCommonErrorType,
      mostCommonAction,
      errorTrend,
      recommendations
    };
  }

  // 통계 초기화
  resetStats(): void {
    errorLogs.splice(0, errorLogs.length);
    Object.assign(errorStats, {
      totalErrors: 0,
      errorsByType: {},
      errorsByAction: {},
      recentErrors: [],
      retrySuccessRate: 0,
      averageRetryAttempts: 0
    });
  }
}

// 전역 에러 모니터 인스턴스
export const errorMonitor = new ErrorMonitor();

// 편의 함수들
export function logAIError(
  errorInfo: {
    type: string;
    message: string;
    userMessage: string;
    retryable: boolean;
    details?: unknown;
  },
  context: {
    action: string;
    retryCount?: number;
    success?: boolean;
    [key: string]: unknown;
  }
): string {
  return errorMonitor.logError(errorInfo, context);
}

export function getErrorStats(): ErrorStats {
  return errorMonitor.getStats();
}

export function getErrorPatterns() {
  return errorMonitor.analyzeErrorPatterns();
}
