// __tests__/drizzle/schema.test.ts
// 데이터베이스 스키마 테스트
// 스키마 정의의 정확성을 검증하는 테스트

import { notes, noteTags, summaries } from '../../drizzle/schema';

describe('Database Schema', () => {
  describe('notes table', () => {
    it('should have correct column definitions', () => {
      expect(notes.id.name).toBe('id');
      expect(notes.userId.name).toBe('user_id');
      expect(notes.title.name).toBe('title');
      expect(notes.content.name).toBe('content');
      expect(notes.createdAt.name).toBe('created_at');
      expect(notes.updatedAt.name).toBe('updated_at');
    });

    it('should have primary key on id', () => {
      expect(notes.id.primary).toBe(true);
    });

    it('should have correct data types', () => {
      expect(notes.id.dataType).toBe('uuid');
      expect(notes.userId.dataType).toBe('uuid');
      expect(notes.title.dataType).toBe('varchar');
      expect(notes.content.dataType).toBe('text');
      expect(notes.createdAt.dataType).toBe('timestamp');
      expect(notes.updatedAt.dataType).toBe('timestamp');
    });
  });

  describe('note_tags table', () => {
    it('should have correct column definitions', () => {
      expect(noteTags.noteId.name).toBe('note_id');
      expect(noteTags.tag.name).toBe('tag');
    });

    it('should have correct data types', () => {
      expect(noteTags.noteId.dataType).toBe('uuid');
      expect(noteTags.tag.dataType).toBe('varchar');
    });

    it('should have foreign key reference to notes', () => {
      expect(noteTags.noteId.references).toBeDefined();
    });
  });

  describe('summaries table', () => {
    it('should have correct column definitions', () => {
      expect(summaries.noteId.name).toBe('note_id');
      expect(summaries.model.name).toBe('model');
      expect(summaries.content.name).toBe('content');
      expect(summaries.createdAt.name).toBe('created_at');
    });

    it('should have correct data types', () => {
      expect(summaries.noteId.dataType).toBe('uuid');
      expect(summaries.model.dataType).toBe('varchar');
      expect(summaries.content.dataType).toBe('text');
      expect(summaries.createdAt.dataType).toBe('timestamp');
    });

    it('should have foreign key reference to notes', () => {
      expect(summaries.noteId.references).toBeDefined();
    });
  });
});
