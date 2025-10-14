// lib/types/database.ts
// 데이터베이스 타입 정의 파일
// Drizzle 스키마에서 추론된 타입들을 재export하여 일관성 유지

export type {
  Note,
  NewNote,
  NoteTag,
  NewNoteTag,
  Summary,
  NewSummary,
} from '../../drizzle/schema';

// 추가 유틸리티 타입들
export type NoteWithTags = Note & {
  tags: NoteTag[];
};

export type NoteWithSummary = Note & {
  summary?: Summary;
};

export type NoteWithTagsAndSummary = Note & {
  tags: NoteTag[];
  summary?: Summary;
};
