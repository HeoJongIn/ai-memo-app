// __tests__/lib/actions/notes.test.ts
// 노트 CRUD 함수 테스트
// Jest 프레임워크를 사용한 단위 테스트

import {
  createNote,
  getUserNotes,
  getNoteById,
  updateNote,
  deleteNote,
  addTagToNote,
  createNoteSummary,
} from '../../../lib/actions/notes';

// Mock 데이터베이스 연결
jest.mock('../../../lib/db', () => ({
  db: {
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
  },
}));

describe('Notes CRUD Functions', () => {
  const mockUserId = 'test-user-id';
  const mockNoteId = 'test-note-id';
  const mockNoteData = {
    title: 'Test Note',
    content: 'This is a test note content',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createNote', () => {
    it('should create a note successfully', async () => {
      const mockDb = require('../../../lib/db').db;
      mockDb.insert().values().returning.mockResolvedValue([{ id: mockNoteId, ...mockNoteData, userId: mockUserId }]);

      const result = await createNote(mockUserId, mockNoteData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should handle creation errors', async () => {
      const mockDb = require('../../../lib/db').db;
      mockDb.insert().values().returning.mockRejectedValue(new Error('Database error'));

      const result = await createNote(mockUserId, mockNoteData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create note');
    });
  });

  describe('getUserNotes', () => {
    it('should fetch user notes successfully', async () => {
      const mockDb = require('../../../lib/db').db;
      const mockNotes = [
        { id: 'note1', userId: mockUserId, title: 'Note 1', content: 'Content 1' },
        { id: 'note2', userId: mockUserId, title: 'Note 2', content: 'Content 2' },
      ];
      mockDb.select().from().where().orderBy.mockResolvedValue(mockNotes);

      const result = await getUserNotes(mockUserId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockNotes);
    });

    it('should handle fetch errors', async () => {
      const mockDb = require('../../../lib/db').db;
      mockDb.select().from().where().orderBy.mockRejectedValue(new Error('Database error'));

      const result = await getUserNotes(mockUserId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to fetch notes');
    });
  });

  describe('getNoteById', () => {
    it('should fetch note by id successfully', async () => {
      const mockDb = require('../../../lib/db').db;
      const mockNote = { id: mockNoteId, userId: mockUserId, ...mockNoteData };
      mockDb.select().from().where().limit.mockResolvedValue([mockNote]);

      const result = await getNoteById(mockUserId, mockNoteId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockNote);
    });

    it('should return error when note not found', async () => {
      const mockDb = require('../../../lib/db').db;
      mockDb.select().from().where().limit.mockResolvedValue([]);

      const result = await getNoteById(mockUserId, mockNoteId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Note not found');
    });
  });

  describe('updateNote', () => {
    it('should update note successfully', async () => {
      const mockDb = require('../../../lib/db').db;
      const updateData = { title: 'Updated Title' };
      const updatedNote = { id: mockNoteId, userId: mockUserId, ...mockNoteData, ...updateData };
      mockDb.update().set().where().returning.mockResolvedValue([updatedNote]);

      const result = await updateNote(mockUserId, mockNoteId, updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedNote);
    });

    it('should return error when note not found', async () => {
      const mockDb = require('../../../lib/db').db;
      mockDb.update().set().where().returning.mockResolvedValue([]);

      const result = await updateNote(mockUserId, mockNoteId, { title: 'Updated Title' });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Note not found or access denied');
    });
  });

  describe('deleteNote', () => {
    it('should delete note successfully', async () => {
      const mockDb = require('../../../lib/db').db;
      const deletedNote = { id: mockNoteId, userId: mockUserId, ...mockNoteData };
      mockDb.delete().where().returning.mockResolvedValue([deletedNote]);

      const result = await deleteNote(mockUserId, mockNoteId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(deletedNote);
    });

    it('should return error when note not found', async () => {
      const mockDb = require('../../../lib/db').db;
      mockDb.delete().where().returning.mockResolvedValue([]);

      const result = await deleteNote(mockUserId, mockNoteId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Note not found or access denied');
    });
  });
});
