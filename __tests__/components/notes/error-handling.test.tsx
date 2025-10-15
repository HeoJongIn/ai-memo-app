// __tests__/components/notes/error-handling.test.tsx
// 에러 처리 UI 컴포넌트 테스트
// 재시도 로직, 에러 복구 가이드, 데이터 보호 기능 검증

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { NoteSummary } from '@/components/notes/note-summary';
import { NoteTags } from '@/components/notes/note-tags';
import { ErrorRecoveryGuide, ErrorStatus } from '@/components/ui/error-recovery-guide';
import { RetryIndicator, RetryButton } from '@/components/ui/retry-indicator';
import { AIErrorType } from '@/lib/types/ai-errors';

// Mock 설정
jest.mock('@/lib/actions/ai', () => ({
  generateSummaryAction: jest.fn(),
  generateTagsAction: jest.fn(),
  updateSummaryAction: jest.fn(),
  updateTagsAction: jest.fn(),
  AIErrorType: {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TOKEN_LIMIT_EXCEEDED: 'TOKEN_LIMIT_EXCEEDED',
    API_ERROR: 'API_ERROR',
    PARSING_ERROR: 'PARSING_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
  }
}));

jest.mock('@/hooks/use-retry', () => ({
  useRetry: jest.fn(() => ({
    retryState: {
      isRetrying: false,
      retryCount: 0,
      maxRetries: 3,
      lastError: null,
      canRetry: true
    },
    executeWithRetry: jest.fn(),
    manualRetry: jest.fn(),
    resetRetry: jest.fn()
  }))
}));

jest.mock('@/lib/utils/data-backup', () => ({
  backupBeforeAIProcessing: jest.fn(() => 'backup-123'),
  rollbackOnFailure: jest.fn(() => Promise.resolve(true))
}));

jest.mock('@/components/ui/toast', () => ({
  useToast: () => ({
    addToast: jest.fn()
  })
}));

jest.mock('@/hooks/use-ai-status', () => ({
  useAIStatus: () => ({
    status: 'idle',
    processType: null,
    message: '',
    error: null,
    setLoading: jest.fn(),
    setSuccess: jest.fn(),
    setError: jest.fn(),
    clearError: jest.fn()
  })
}));

describe('Error Handling Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RetryIndicator', () => {
    it('should show retrying state', () => {
      render(
        <RetryIndicator
          isRetrying={true}
          retryCount={1}
          maxRetries={3}
          lastError={null}
          canRetry={true}
        />
      );

      expect(screen.getByText('재시도 중... (2/3)')).toBeInTheDocument();
      expect(screen.getByText('잠시만 기다려주세요. 자동으로 다시 시도하고 있습니다.')).toBeInTheDocument();
    });

    it('should show retryable error state', () => {
      render(
        <RetryIndicator
          isRetrying={false}
          retryCount={0}
          maxRetries={3}
          lastError="Network error"
          canRetry={true}
          onManualRetry={jest.fn()}
          onDismiss={jest.fn()}
        />
      );

      expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
      expect(screen.getByText('다시 시도')).toBeInTheDocument();
    });

    it('should show non-retryable error state', () => {
      render(
        <RetryIndicator
          isRetrying={false}
          retryCount={2}
          maxRetries={3}
          lastError="Authentication failed"
          canRetry={false}
          onDismiss={jest.fn()}
        />
      );

      expect(screen.getByText('재시도 한계에 도달했습니다')).toBeInTheDocument();
      expect(screen.getByText('Authentication failed')).toBeInTheDocument();
      expect(screen.getByText('잠시 후 다시 시도하거나 관리자에게 문의해주세요.')).toBeInTheDocument();
    });

    it('should call manual retry when retry button clicked', () => {
      const onManualRetry = jest.fn();
      render(
        <RetryIndicator
          isRetrying={false}
          retryCount={0}
          maxRetries={3}
          lastError="Network error"
          canRetry={true}
          onManualRetry={onManualRetry}
        />
      );

      fireEvent.click(screen.getByText('다시 시도'));
      expect(onManualRetry).toHaveBeenCalled();
    });
  });

  describe('ErrorRecoveryGuide', () => {
    it('should show network error recovery guide', () => {
      render(
        <ErrorRecoveryGuide
          errorType={AIErrorType.NETWORK_ERROR}
          errorMessage="Connection timeout"
          onRetry={jest.fn()}
        />
      );

      expect(screen.getByText('네트워크 연결 문제')).toBeInTheDocument();
      expect(screen.getByText('인터넷 연결에 문제가 있습니다.')).toBeInTheDocument();
      expect(screen.getByText('인터넷 연결 상태를 확인해주세요')).toBeInTheDocument();
    });

    it('should show token limit error recovery guide', () => {
      render(
        <ErrorRecoveryGuide
          errorType={AIErrorType.TOKEN_LIMIT_EXCEEDED}
          errorMessage="Text too long"
          onManualEdit={jest.fn()}
        />
      );

      expect(screen.getByText('텍스트가 너무 깁니다')).toBeInTheDocument();
      expect(screen.getByText('노트 내용이 AI 처리 한계를 초과했습니다.')).toBeInTheDocument();
      expect(screen.getByText('노트 내용을 여러 개로 나누어주세요')).toBeInTheDocument();
    });

    it('should call retry action when retry button clicked', () => {
      const onRetry = jest.fn();
      render(
        <ErrorRecoveryGuide
          errorType={AIErrorType.NETWORK_ERROR}
          errorMessage="Connection timeout"
          onRetry={onRetry}
        />
      );

      fireEvent.click(screen.getByText('다시 시도'));
      expect(onRetry).toHaveBeenCalled();
    });

    it('should call manual edit action when manual edit button clicked', () => {
      const onManualEdit = jest.fn();
      render(
        <ErrorRecoveryGuide
          errorType={AIErrorType.TOKEN_LIMIT_EXCEEDED}
          errorMessage="Text too long"
          onManualEdit={onManualEdit}
        />
      );

      fireEvent.click(screen.getByText('수동으로 작성'));
      expect(onManualEdit).toHaveBeenCalled();
    });
  });

  describe('ErrorStatus', () => {
    it('should show error status with retry button', () => {
      const onRetry = jest.fn();
      render(
        <ErrorStatus
          errorType={AIErrorType.NETWORK_ERROR}
          message="Network error occurred"
          onRetry={onRetry}
        />
      );

      expect(screen.getByText('Network error occurred')).toBeInTheDocument();
      expect(screen.getByText('재시도')).toBeInTheDocument();
    });

    it('should call retry when retry button clicked', () => {
      const onRetry = jest.fn();
      render(
        <ErrorStatus
          errorType={AIErrorType.API_ERROR}
          message="API error occurred"
          onRetry={onRetry}
        />
      );

      fireEvent.click(screen.getByText('재시도'));
      expect(onRetry).toHaveBeenCalled();
    });
  });

  describe('NoteSummary Error Handling', () => {
    it('should handle error state and show recovery guide', async () => {
      const { generateSummaryAction } = require('@/lib/actions/ai');
      generateSummaryAction.mockResolvedValue({
        success: false,
        error: 'Network error',
        errorType: AIErrorType.NETWORK_ERROR,
        retryable: true
      });

      const { useRetry } = require('@/hooks/use-retry');
      useRetry.mockReturnValue({
        retryState: {
          isRetrying: false,
          retryCount: 0,
          maxRetries: 3,
          lastError: 'Network error',
          canRetry: true
        },
        executeWithRetry: jest.fn().mockRejectedValue(new Error('Network error')),
        manualRetry: jest.fn(),
        resetRetry: jest.fn()
      });

      render(<NoteSummary noteId="note-123" />);

      // 요약 생성 버튼 클릭
      fireEvent.click(screen.getByText('AI 요약 생성'));

      await waitFor(() => {
        expect(screen.getByText('네트워크 연결 문제')).toBeInTheDocument();
      });
    });
  });

  describe('NoteTags Error Handling', () => {
    it('should handle error state and show recovery guide', async () => {
      const { generateTagsAction } = require('@/lib/actions/ai');
      generateTagsAction.mockResolvedValue({
        success: false,
        error: 'API error',
        errorType: AIErrorType.API_ERROR,
        retryable: true
      });

      const { useRetry } = require('@/hooks/use-retry');
      useRetry.mockReturnValue({
        retryState: {
          isRetrying: false,
          retryCount: 0,
          maxRetries: 3,
          lastError: 'API error',
          canRetry: true
        },
        executeWithRetry: jest.fn().mockRejectedValue(new Error('API error')),
        manualRetry: jest.fn(),
        resetRetry: jest.fn()
      });

      render(<NoteTags noteId="note-123" />);

      // 태그 생성 버튼 클릭
      fireEvent.click(screen.getByText('AI 태그 생성'));

      await waitFor(() => {
        expect(screen.getByText('AI 서비스 일시 중단')).toBeInTheDocument();
      });
    });
  });

  describe('Data Backup and Rollback', () => {
    it('should create backup before AI processing', async () => {
      const { backupBeforeAIProcessing } = require('@/lib/utils/data-backup');
      
      render(<NoteSummary noteId="note-123" existingSummary={{ content: 'Existing summary' }} />);

      fireEvent.click(screen.getByText('AI 요약 생성'));

      expect(backupBeforeAIProcessing).toHaveBeenCalledWith(
        'note-123',
        'Existing summary',
        []
      );
    });

    it('should rollback on failure', async () => {
      const { rollbackOnFailure } = require('@/lib/utils/data-backup');
      const { generateSummaryAction } = require('@/lib/actions/ai');
      
      generateSummaryAction.mockRejectedValue(new Error('Processing failed'));

      const { useRetry } = require('@/hooks/use-retry');
      useRetry.mockReturnValue({
        retryState: {
          isRetrying: false,
          retryCount: 0,
          maxRetries: 3,
          lastError: 'Processing failed',
          canRetry: false
        },
        executeWithRetry: jest.fn().mockRejectedValue(new Error('Processing failed')),
        manualRetry: jest.fn(),
        resetRetry: jest.fn()
      });

      render(<NoteSummary noteId="note-123" />);

      fireEvent.click(screen.getByText('AI 요약 생성'));

      await waitFor(() => {
        expect(rollbackOnFailure).toHaveBeenCalled();
      });
    });
  });
});
