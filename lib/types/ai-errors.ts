// lib/types/ai-errors.ts
// AI 에러 관련 타입 정의
// AI 처리 중 발생하는 에러 타입과 정보를 정의

// 에러 타입 정의
export enum AIErrorType {
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  TOKEN_LIMIT_EXCEEDED = 'TOKEN_LIMIT_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  PARSING_ERROR = 'PARSING_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// 에러 정보 인터페이스
export interface AIErrorInfo {
  type: AIErrorType;
  message: string;
  userMessage: string;
  retryable: boolean;
  details?: unknown;
}
