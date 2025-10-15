// lib/actions/notes.ts
// 노트 CRUD 함수 템플릿
// 사용자 스코프 기반 보안을 적용한 노트 관리 함수들
// Server Actions으로 구현되어 클라이언트에서 호출 가능

'use server';

import { eq, and, desc, sql } from 'drizzle-orm';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { db } from '../db';
import { notes, noteTags, summaries, draftNotes, type NewNote } from '../../drizzle/schema';

// 노트 생성 서버 액션 (클라이언트에서 호출)
export async function createNoteAction(title: string, content: string) {
  try {
    // 사용자 인증 확인
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 입력 데이터 유효성 검증
    if (!title.trim()) {
      return { success: false, error: '제목을 입력해주세요.' };
    }
    
    if (!content.trim()) {
      return { success: false, error: '본문을 입력해주세요.' };
    }

    if (title.length > 255) {
      return { success: false, error: '제목은 255자를 초과할 수 없습니다.' };
    }

    // 노트 생성
    const result = await createNote(user.id, {
      title: title.trim(),
      content: content.trim(),
    });

    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error in createNoteAction:', error);
    return { success: false, error: '노트 생성 중 오류가 발생했습니다.' };
  }
}

// 노트 목록 조회 서버 액션 (클라이언트에서 호출)
export async function getNotesAction(
  page: number = 1, 
  limit: number = 10, 
  sortBy: 'latest' | 'title' | 'oldest' = 'latest'
) {
  try {
    // 사용자 인증 확인
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 페이지네이션된 노트 조회 (정렬 옵션 포함)
    const result = await getUserNotesPaginated(user.id, page, limit, sortBy);

    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error in getNotesAction:', error);
    return { success: false, error: '노트 목록 조회 중 오류가 발생했습니다.' };
  }
}

// 노트 상세 조회 서버 액션 (클라이언트에서 호출)
export async function getNoteAction(noteId: string) {
  try {
    // 사용자 인증 확인
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 노트 상세 조회
    const result = await getNoteById(user.id, noteId);

    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error in getNoteAction:', error);
    return { success: false, error: '노트 조회 중 오류가 발생했습니다.' };
  }
}

// 노트 삭제 서버 액션 (클라이언트에서 호출)
export async function deleteNoteAction(noteId: string) {
  try {
    // 사용자 인증 확인
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 노트 삭제
    const result = await deleteNote(user.id, noteId);

    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error in deleteNoteAction:', error);
    return { success: false, error: '노트 삭제 중 오류가 발생했습니다.' };
  }
}

// 노트 수정 서버 액션 (클라이언트에서 호출)
export async function updateNoteAction(noteId: string, title: string, content: string) {
  try {
    // 사용자 인증 확인
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 입력 데이터 유효성 검증
    if (!title.trim()) {
      return { success: false, error: '제목을 입력해주세요.' };
    }
    
    if (!content.trim()) {
      return { success: false, error: '본문을 입력해주세요.' };
    }

    if (title.length > 255) {
      return { success: false, error: '제목은 255자를 초과할 수 없습니다.' };
    }

    // 노트 수정
    const result = await updateNote(user.id, noteId, {
      title: title.trim(),
      content: content.trim(),
    });

    if (!result.success) {
      return result;
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Error in updateNoteAction:', error);
    return { success: false, error: '노트 수정 중 오류가 발생했습니다.' };
  }
}

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

// 페이지네이션을 지원하는 사용자 노트 조회 (정렬 옵션 포함)
export async function getUserNotesPaginated(
  userId: string, 
  page: number = 1, 
  limit: number = 10, 
  sortBy: 'latest' | 'title' | 'oldest' = 'latest'
) {
  try {
    const offset = (page - 1) * limit;
    
    // 총 노트 수 조회
    const totalCountResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(notes)
      .where(eq(notes.userId, userId));
    
    const totalCount = totalCountResult[0]?.count || 0;
    
    // 정렬 옵션에 따른 orderBy 절 결정 (잘못된 값은 기본값으로 폴백)
    let orderByClause;
    let actualSortBy = sortBy;
    
    switch (sortBy) {
      case 'title':
        orderByClause = sql`${notes.title} ASC`;
        break;
      case 'oldest':
        orderByClause = sql`${notes.createdAt} ASC`;
        break;
      case 'latest':
      default:
        orderByClause = sql`${notes.createdAt} DESC`;
        actualSortBy = 'latest'; // 잘못된 값일 때 기본값으로 설정
        break;
    }
    
    // 페이지네이션된 노트 조회
    const userNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.userId, userId))
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(totalCount / limit);

    return { 
      success: true, 
      data: {
        notes: userNotes,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        },
        sortBy: actualSortBy
      }
    };
  } catch (error) {
    console.error('Error fetching user notes with pagination:', error);
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

// 노트 삭제 (사용자 스코프 확인 및 연쇄 삭제)
export async function deleteNote(userId: string, noteId: string) {
  try {
    // 먼저 노트 존재 여부 및 소유권 확인
    const existingNote = await getNoteById(userId, noteId);
    if (!existingNote.success) {
      return { success: false, error: 'Note not found or access denied' };
    }

    // 노트 삭제 (연쇄 삭제는 데이터베이스에서 자동 처리)
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

// 노트 요약 조회 서버 액션 (클라이언트에서 호출)
export async function getSummaryAction(noteId: string) {
  try {
    // 사용자 인증 확인
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 노트 소유권 확인
    const note = await getNoteById(user.id, noteId);
    if (!note.success) {
      return { success: false, error: '노트를 찾을 수 없습니다.' };
    }

    // 요약 조회
    const [summary] = await db
      .select()
      .from(summaries)
      .where(eq(summaries.noteId, noteId))
      .limit(1);

    return { success: true, data: summary || null };
  } catch (error) {
    console.error('Error in getSummaryAction:', error);
    return { success: false, error: '요약 조회 중 오류가 발생했습니다.' };
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

// 임시 저장 서버 액션 (클라이언트에서 호출)
export async function saveDraftAction(title: string, content: string) {
  try {
    // 사용자 인증 확인
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 7일 후 만료 시간 계산
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 임시 저장
    const [newDraft] = await db
      .insert(draftNotes)
      .values({
        userId: user.id,
        title: title || '제목 없음',
        content: content || '',
        expiresAt,
      })
      .returning();

    return { success: true, data: newDraft };
  } catch (error) {
    console.error('Error saving draft:', error);
    return { success: false, error: '임시 저장 중 오류가 발생했습니다.' };
  }
}

// 임시 저장된 노트 목록 조회 서버 액션 (클라이언트에서 호출)
export async function getDraftsAction() {
  try {
    // 사용자 인증 확인
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 만료되지 않은 임시 저장된 노트 조회
    const drafts = await db
      .select()
      .from(draftNotes)
      .where(and(
        eq(draftNotes.userId, user.id),
        sql`${draftNotes.expiresAt} > NOW()`
      ))
      .orderBy(desc(draftNotes.updatedAt));

    return { success: true, data: drafts };
  } catch (error) {
    console.error('Error fetching drafts:', error);
    return { success: false, error: '임시 저장된 노트 조회 중 오류가 발생했습니다.' };
  }
}

// 임시 노트를 정식 노트로 변환하는 서버 액션 (클라이언트에서 호출)
export async function convertDraftToNoteAction(draftId: string) {
  try {
    // 사용자 인증 확인
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 임시 노트 조회 및 소유권 확인
    const [draft] = await db
      .select()
      .from(draftNotes)
      .where(and(
        eq(draftNotes.id, draftId),
        eq(draftNotes.userId, user.id)
      ));

    if (!draft) {
      return { success: false, error: '임시 저장된 노트를 찾을 수 없습니다.' };
    }

    // 정식 노트로 변환
    const [newNote] = await db
      .insert(notes)
      .values({
        userId: user.id,
        title: draft.title,
        content: draft.content,
      })
      .returning();

    // 임시 노트 삭제
    await db
      .delete(draftNotes)
      .where(eq(draftNotes.id, draftId));

    return { success: true, data: newNote };
  } catch (error) {
    console.error('Error converting draft to note:', error);
    return { success: false, error: '노트 변환 중 오류가 발생했습니다.' };
  }
}

// 임시 노트 삭제 서버 액션 (클라이언트에서 호출)
export async function deleteDraftAction(draftId: string) {
  try {
    // 사용자 인증 확인
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 임시 노트 삭제 (소유권 확인 포함)
    await db
      .delete(draftNotes)
      .where(and(
        eq(draftNotes.id, draftId),
        eq(draftNotes.userId, user.id)
      ));

    return { success: true };
  } catch (error) {
    console.error('Error deleting draft:', error);
    return { success: false, error: '임시 노트 삭제 중 오류가 발생했습니다.' };
  }
}

// 만료된 임시 노트 정리 함수 (배치 처리용)
export async function cleanupExpiredDrafts() {
  try {
    await db
      .delete(draftNotes)
      .where(sql`${draftNotes.expiresAt} <= NOW()`);

    console.log(`Cleaned up expired drafts`);
    return { success: true, deletedCount: 0 };
  } catch (error) {
    console.error('Error cleaning up expired drafts:', error);
    return { success: false, error: '만료된 임시 노트 정리 중 오류가 발생했습니다.' };
  }
}

// 노트 태그 조회 서버 액션 (클라이언트에서 호출)
export async function getTagsAction(noteId: string) {
  try {
    // 사용자 인증 확인
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 노트 소유권 확인
    const note = await getNoteById(user.id, noteId);
    if (!note.success) {
      return { success: false, error: '노트를 찾을 수 없습니다.' };
    }

    // 태그 조회
    const tags = await db
      .select({ tag: noteTags.tag })
      .from(noteTags)
      .where(eq(noteTags.noteId, noteId));

    return { success: true, data: tags.map(t => t.tag) };
  } catch (error) {
    console.error('Error in getTagsAction:', error);
    return { success: false, error: '태그 조회 중 오류가 발생했습니다.' };
  }
}

// 모든 노트 삭제 서버 액션 (클라이언트에서 호출)
export async function deleteAllNotesAction() {
  try {
    // 사용자 인증 확인
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { success: false, error: '로그인이 필요합니다.' };
    }

    // 사용자의 모든 노트 삭제 (cascade로 관련 데이터도 자동 삭제됨)
    const deletedNotes = await db
      .delete(notes)
      .where(eq(notes.userId, user.id))
      .returning({ id: notes.id });

    return { 
      success: true, 
      data: { 
        deletedCount: deletedNotes.length,
        deletedNoteIds: deletedNotes.map(note => note.id)
      } 
    };
  } catch (error) {
    console.error('Error deleting all notes:', error);
    return { success: false, error: '모든 노트 삭제 중 오류가 발생했습니다.' };
  }
}

