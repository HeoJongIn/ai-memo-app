// lib/actions/notes.ts
// 노트 CRUD 함수 템플릿
// 사용자 스코프 기반 보안을 적용한 노트 관리 함수들
// Server Actions으로 구현되어 클라이언트에서 호출 가능

'use server';

import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db';
import { notes, noteTags, summaries } from '../../drizzle/schema';
import type { NewNote, NewNoteTag, NewSummary } from '../types/database';

// 노트 생성
export async function createNote(userId: string, noteData: Omit<NewNote, 'userId'>) {
  try {
    const [newNote] = await db
      .insert(notes)
      .values({
        ...noteData,
        userId,
      })
      .returning();

    return { success: true, data: newNote };
  } catch (error) {
    console.error('Error creating note:', error);
    return { success: false, error: 'Failed to create note' };
  }
}

// 사용자의 모든 노트 조회
export async function getUserNotes(userId: string) {
  try {
    const userNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(desc(notes.updatedAt));

    return { success: true, data: userNotes };
  } catch (error) {
    console.error('Error fetching user notes:', error);
    return { success: false, error: 'Failed to fetch notes' };
  }
}

// 특정 노트 조회 (사용자 스코프 확인)
export async function getNoteById(userId: string, noteId: string) {
  try {
    const [note] = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .limit(1);

    if (!note) {
      return { success: false, error: 'Note not found' };
    }

    return { success: true, data: note };
  } catch (error) {
    console.error('Error fetching note:', error);
    return { success: false, error: 'Failed to fetch note' };
  }
}

// 노트 수정 (사용자 스코프 확인)
export async function updateNote(
  userId: string,
  noteId: string,
  updateData: Partial<Omit<NewNote, 'userId' | 'id'>>
) {
  try {
    const [updatedNote] = await db
      .update(notes)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning();

    if (!updatedNote) {
      return { success: false, error: 'Note not found or access denied' };
    }

    return { success: true, data: updatedNote };
  } catch (error) {
    console.error('Error updating note:', error);
    return { success: false, error: 'Failed to update note' };
  }
}

// 노트 삭제 (사용자 스코프 확인)
export async function deleteNote(userId: string, noteId: string) {
  try {
    const [deletedNote] = await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, userId)))
      .returning();

    if (!deletedNote) {
      return { success: false, error: 'Note not found or access denied' };
    }

    return { success: true, data: deletedNote };
  } catch (error) {
    console.error('Error deleting note:', error);
    return { success: false, error: 'Failed to delete note' };
  }
}

// 노트에 태그 추가
export async function addTagToNote(userId: string, noteId: string, tag: string) {
  try {
    // 먼저 노트 소유권 확인
    const note = await getNoteById(userId, noteId);
    if (!note.success) {
      return note;
    }

    const [newTag] = await db
      .insert(noteTags)
      .values({
        noteId,
        tag,
      })
      .returning();

    return { success: true, data: newTag };
  } catch (error) {
    console.error('Error adding tag to note:', error);
    return { success: false, error: 'Failed to add tag' };
  }
}

// 노트 요약 생성 (AI용)
export async function createNoteSummary(noteId: string, model: string, content: string) {
  try {
    const [newSummary] = await db
      .insert(summaries)
      .values({
        noteId,
        model,
        content,
      })
      .returning();

    return { success: true, data: newSummary };
  } catch (error) {
    console.error('Error creating note summary:', error);
    return { success: false, error: 'Failed to create summary' };
  }
}
