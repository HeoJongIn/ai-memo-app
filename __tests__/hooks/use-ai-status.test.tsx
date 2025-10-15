// __tests__/hooks/use-ai-status.test.tsx
// AI 상태 관리 훅 테스트
// 상태 전환, 타입 정의, 액션 함수 동작 검증

import { renderHook, act } from '@testing-library/react';
import { useAIStatus } from '@/hooks/use-ai-status';

describe('useAIStatus', () => {
  it('초기 상태가 올바르게 설정된다', () => {
    const { result } = renderHook(() => useAIStatus());

    expect(result.current.status).toBe('idle');
    expect(result.current.processType).toBeNull();
    expect(result.current.message).toBe('');
    expect(result.current.error).toBeUndefined();
  });

  it('로딩 상태를 올바르게 설정한다', () => {
    const { result } = renderHook(() => useAIStatus());

    act(() => {
      result.current.setLoading('summary', '요약 생성 중...');
    });

    expect(result.current.status).toBe('loading');
    expect(result.current.processType).toBe('summary');
    expect(result.current.message).toBe('요약 생성 중...');
    expect(result.current.timestamp).toBeInstanceOf(Date);
  });

  it('성공 상태를 올바르게 설정한다', () => {
    const { result } = renderHook(() => useAIStatus());

    act(() => {
      result.current.setSuccess('tags', '태그 생성 완료');
    });

    expect(result.current.status).toBe('success');
    expect(result.current.processType).toBe('tags');
    expect(result.current.message).toBe('태그 생성 완료');
    expect(result.current.timestamp).toBeInstanceOf(Date);
  });

  it('에러 상태를 올바르게 설정한다', () => {
    const { result } = renderHook(() => useAIStatus());

    act(() => {
      result.current.setError('summary', 'API 오류', '요약 생성 실패');
    });

    expect(result.current.status).toBe('error');
    expect(result.current.processType).toBe('summary');
    expect(result.current.message).toBe('요약 생성 실패');
    expect(result.current.error).toBe('API 오류');
    expect(result.current.timestamp).toBeInstanceOf(Date);
  });

  it('상태를 리셋한다', () => {
    const { result } = renderHook(() => useAIStatus());

    // 먼저 상태를 변경
    act(() => {
      result.current.setLoading('summary');
    });

    expect(result.current.status).toBe('loading');

    // 리셋
    act(() => {
      result.current.reset();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.processType).toBeNull();
    expect(result.current.message).toBe('');
  });

  it('에러를 클리어한다', () => {
    const { result } = renderHook(() => useAIStatus());

    // 에러 상태 설정
    act(() => {
      result.current.setError('summary', 'API 오류');
    });

    expect(result.current.status).toBe('error');

    // 에러 클리어
    act(() => {
      result.current.clearError();
    });

    expect(result.current.status).toBe('idle');
    expect(result.current.error).toBeUndefined();
  });

  it('기본 메시지를 올바르게 설정한다', () => {
    const { result } = renderHook(() => useAIStatus());

    act(() => {
      result.current.setLoading('summary');
    });

    expect(result.current.message).toBe('요약 생성 중...');

    act(() => {
      result.current.setLoading('tags');
    });

    expect(result.current.message).toBe('태그 생성 중...');
  });

  it('타임스탬프가 올바르게 설정된다', () => {
    const { result } = renderHook(() => useAIStatus());
    const beforeTime = new Date();

    act(() => {
      result.current.setLoading('summary');
    });

    const afterTime = new Date();
    expect(result.current.timestamp).toBeInstanceOf(Date);
    expect(result.current.timestamp!.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
    expect(result.current.timestamp!.getTime()).toBeLessThanOrEqual(afterTime.getTime());
  });
});
