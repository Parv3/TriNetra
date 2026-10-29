export interface User {
  id: string;
  email: string;
  name: string;
  registeredPhotoUrl: string;
  role?: 'student' | 'examiner';
}

export interface SessionStatus {
  sessionId: string;
  userId: string;
  isActive: boolean;
  activeDeviceId?: string;
  lastHeartbeat: string;
}

export interface Question {
  id: string;
  text: string;
  category: 'Machine Learning' | 'Data Structures & Algorithms' | 'Quantitative Aptitude' | 'Logical Reasoning';
  options: string[];
  correctOptionIndex: number;
  marks: number;
}

export interface TestInfo {
  id: string;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  totalQuestions: number;
  maxWarnings: number;
  instructions: string[];
  status: 'assigned' | 'in_progress' | 'completed' | 'disqualified';
  score?: number;
  totalMarks?: number;
}

export interface AnswerRecord {
  questionId: string;
  selectedOption: number | null; // 0, 1, 2, 3 or null
  isMarkedForReview: boolean;
  timestamp: number;
  synced: boolean;
}

export type ProctorViolationType =
  | 'NO_FACE_DETECTED'
  | 'MULTIPLE_FACES_DETECTED'
  | 'FACE_TURNED_AWAY'
  | 'EYES_OFF_SCREEN'
  | 'CAMERA_BLOCKED_OR_DARK'
  | 'TAB_SWITCH'
  | 'WINDOW_BLUR'
  | 'FULLSCREEN_EXIT'
  | 'SUSPICIOUS_SHORTCUT'
  | 'DEVTOOLS_ATTEMPT'
  | 'EXTERNAL_DISPLAY_CONNECTED'
  | 'AI_TOOL_ACCESSED';

export interface ProctorEvent {
  id?: string;
  sessionId: string;
  type: ProctorViolationType | 'HEARTBEAT' | 'KEYSTROKE_STAT' | 'MOUSE_STAT' | 'BROWSER_NAVIGATION';
  severity: 'info' | 'warning' | 'violation';
  timestamp: number;
  details: Record<string, any>;
  snapshotUrl?: string;
  synced?: boolean;
}

export interface ActivityLogItem {
  id: string;
  timestamp: number;
  formattedTime: string;
  action: 'OPENED_TAB' | 'SEARCHED' | 'CLOSED_TAB' | 'NAVIGATED';
  domain: string;
  title?: string;
  query?: string;
  durationSec?: number;
  category: 'AI_TOOL' | 'SEARCH' | 'OTHER';
}

export interface StudentAnalytics {
  studentId: string;
  scoreTrend: { testName: string; score: number; maxScore: number }[];
  topicScores: { topic: string; score: number; total: number }[];
  skillRadar: { subject: string; value: number }[];
  integrityScore: number; // 0 - 100%
  totalViolations: number;
}

export interface StudentSummary {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  status: 'online' | 'testing' | 'submitted' | 'disqualified';
  riskScore: 'green' | 'amber' | 'red';
  warningsCount: number;
  currentTestTitle: string;
  lastSnapshotUrl: string;
  eventsCount: number;
}

export interface SubmissionResponse {
  success: boolean;
  score: number;
  totalMarks: number;
  correctCount: number;
  wrongCount: number;
  skippedCount: number;
  timeSpentSec: number;
  submittedAt: string;
  integritySummary: {
    warningsIssued: number;
    integrityRating: 'Clean' | 'Minor Flags' | 'Compromised';
    riskRating: 'Low' | 'Medium' | 'High';
  };
  message: string;
}
