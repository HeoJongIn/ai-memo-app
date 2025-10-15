// drizzle/schema.ts
// 데이터베이스 스키마 정의 파일
// 노트 관리 시스템을 위한 테이블 스키마 정의
// 사용자 스코프 기반 보안을 위한 user_id 필드 포함

import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// notes 테이블: 사용자의 메모 저장
export const notes = pgTable('notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(), // 사용자 스코프를 위한 필드
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// note_tags 테이블: 노트의 태그 정보
export const noteTags = pgTable('note_tags', {
  noteId: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  tag: varchar('tag', { length: 100 }).notNull(),
});

// summaries 테이블: AI가 생성한 노트 요약
export const summaries = pgTable('summaries', {
  noteId: uuid('note_id').notNull().references(() => notes.id, { onDelete: 'cascade' }),
  model: varchar('model', { length: 100 }).notNull(), // 사용된 AI 모델 (예: 'gemini-pro')
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// draft_notes 테이블: 임시 저장된 노트
export const draftNotes = pgTable('draft_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(), // 사용자 스코프를 위한 필드
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(), // 자동 삭제를 위한 만료 시간
});


// 타입 정의를 위한 export
export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
export type NoteTag = typeof noteTags.$inferSelect;
export type NewNoteTag = typeof noteTags.$inferInsert;
export type Summary = typeof summaries.$inferSelect;
export type NewSummary = typeof summaries.$inferInsert;
export type DraftNote = typeof draftNotes.$inferSelect;
export type NewDraftNote = typeof draftNotes.$inferInsert;
