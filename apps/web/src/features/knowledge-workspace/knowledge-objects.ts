export type KnowledgeObjectType =
  | 'document'
  | 'note'
  | 'conversation'
  | 'transcript'
  | 'bookmark'
  | 'task'
  | 'flashcard'
  | 'summary'
  | 'collection';

export interface KnowledgeObject {
  id: string;
  type: KnowledgeObjectType;
  title: string;
  subtitle?: string;
  source?: string;
  created: string;
  modified: string;
  tags?: string[];
  connections?: string[];
}

export const OBJECT_ICONS: Record<KnowledgeObjectType, string> = {
  document: 'file-text',
  note: 'sticky-note',
  conversation: 'message-square',
  transcript: 'mic',
  bookmark: 'bookmark',
  task: 'check-square',
  flashcard: 'layers',
  summary: 'file-plus',
  collection: 'folder',
};
