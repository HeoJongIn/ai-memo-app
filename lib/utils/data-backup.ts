// lib/utils/data-backup.ts
// 데이터 백업 및 복원 유틸리티
// AI 처리 실패 시 원본 데이터를 보존하고 롤백 기능을 제공

export interface DataBackup {
  id: string;
  timestamp: Date;
  data: unknown;
  type: 'summary' | 'tags' | 'both';
}

export interface BackupManager {
  createBackup: (noteId: string, data: unknown, type: DataBackup['type']) => string;
  restoreBackup: (backupId: string) => Promise<boolean>;
  getBackup: (backupId: string) => DataBackup | null;
  clearBackup: (backupId: string) => void;
  clearExpiredBackups: () => void;
}

// 메모리 기반 백업 저장소 (실제 프로덕션에서는 Redis나 DB 사용 권장)
const backupStorage = new Map<string, DataBackup>();

// 백업 만료 시간 (1시간)
const BACKUP_EXPIRY_MS = 60 * 60 * 1000;

// 만료된 백업을 정리하는 헬퍼 함수
function clearExpiredBackups(): void {
  const now = new Date();
  let clearedCount = 0;
  
  for (const [backupId, backup] of backupStorage.entries()) {
    const backupAge = now.getTime() - backup.timestamp.getTime();
    if (backupAge > BACKUP_EXPIRY_MS) {
      backupStorage.delete(backupId);
      clearedCount++;
    }
  }
  
  if (clearedCount > 0) {
    console.log(`만료된 백업 ${clearedCount}개 정리 완료`);
  }
}

export function createBackupManager(): BackupManager {
  return {
    createBackup: (noteId: string, data: unknown, type: DataBackup['type']): string => {
      const backupId = `${noteId}_${type}_${Date.now()}`;
      const backup: DataBackup = {
        id: backupId,
        timestamp: new Date(),
        data: JSON.parse(JSON.stringify(data)), // 깊은 복사
        type
      };
      
      backupStorage.set(backupId, backup);
      
      // 만료된 백업 정리
      clearExpiredBackups();
      
      console.log(`데이터 백업 생성: ${backupId}`, { noteId, type, dataSize: JSON.stringify(data).length });
      return backupId;
    },

    restoreBackup: async (backupId: string): Promise<boolean> => {
      const backup = backupStorage.get(backupId);
      if (!backup) {
        console.warn(`백업을 찾을 수 없습니다: ${backupId}`);
        return false;
      }

      // 백업이 만료되었는지 확인
      const now = new Date();
      const backupAge = now.getTime() - backup.timestamp.getTime();
      if (backupAge > BACKUP_EXPIRY_MS) {
        console.warn(`백업이 만료되었습니다: ${backupId}`);
        backupStorage.delete(backupId);
        return false;
      }

      console.log(`데이터 복원: ${backupId}`, { type: backup.type, dataSize: JSON.stringify(backup.data).length });
      return true;
    },

    getBackup: (backupId: string): DataBackup | null => {
      const backup = backupStorage.get(backupId);
      if (!backup) {
        return null;
      }

      // 백업이 만료되었는지 확인
      const now = new Date();
      const backupAge = now.getTime() - backup.timestamp.getTime();
      if (backupAge > BACKUP_EXPIRY_MS) {
        backupStorage.delete(backupId);
        return null;
      }

      return backup;
    },

    clearBackup: (backupId: string): void => {
      const existed = backupStorage.delete(backupId);
      console.log(`백업 삭제: ${backupId}`, { existed });
    },

    clearExpiredBackups: (): void => {
      clearExpiredBackups();
    }
  };
}

// 전역 백업 매니저 인스턴스
export const backupManager = createBackupManager();

// AI 처리 전 데이터 백업 헬퍼 함수
export function backupBeforeAIProcessing(
  noteId: string, 
  currentSummary: string | null, 
  currentTags: string[]
): string {
  const backupData = {
    summary: currentSummary,
    tags: currentTags,
    noteId
  };
  
  return backupManager.createBackup(noteId, backupData, 'both');
}

// AI 처리 실패 시 롤백 헬퍼 함수
export async function rollbackOnFailure(
  backupId: string,
  setSummary: (summary: string | null) => void,
  setTags: (tags: string[]) => void
): Promise<boolean> {
  const backup = backupManager.getBackup(backupId);
  if (!backup) {
    return false;
  }

  try {
    // 원본 데이터로 복원
    setSummary(backup.data.summary);
    setTags(backup.data.tags);
    
    console.log(`데이터 롤백 완료: ${backupId}`);
    return true;
  } catch (error) {
    console.error(`데이터 롤백 실패: ${backupId}`, error);
    return false;
  }
}
