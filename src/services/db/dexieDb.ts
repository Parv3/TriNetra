import Dexie, { type EntityTable } from 'dexie';
import { AnswerRecord, ProctorEvent } from '@/types/api';

export interface LocalAnswerRecord extends AnswerRecord {
  id?: number;
  testId: string;
}

export interface LocalProctorEventRecord extends ProctorEvent {
  localId?: number;
}

const db = new Dexie('SmartProctoringBrowserDB') as Dexie & {
  answers: EntityTable<LocalAnswerRecord, 'id'>;
  proctorEvents: EntityTable<LocalProctorEventRecord, 'localId'>;
};

// Schema definition
db.version(1).stores({
  answers: '++id, [testId+questionId], synced, timestamp',
  proctorEvents: '++localId, sessionId, type, synced, timestamp',
});

export { db };

