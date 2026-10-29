import {
  User,
  TestInfo,
  Question,
  AnswerRecord,
  ProctorEvent,
  SubmissionResponse,
  SessionStatus,
  ActivityLogItem,
  StudentAnalytics,
  StudentSummary,
} from '@/types/api';

export const SAMPLE_QUESTIONS: Question[] = [
  // CS / ML Questions
  {
    id: 'q1',
    text: 'What is the primary computational bottleneck of standard self-attention with respect to sequence length L in Transformers?',
    category: 'Machine Learning',
    options: ['Linear complexity O(L)', 'Logarithmic complexity O(log L)', 'Quadratic memory & compute O(L²)', 'Cubic latency O(L³)'],
    correctOptionIndex: 2,
    marks: 4,
  },
  {
    id: 'q2',
    text: 'Which data structure offers an average O(1) time complexity for search, insert, and delete operations?',
    category: 'Data Structures & Algorithms',
    options: ['Balanced Binary Search Tree (AVL)', 'Hash Table with linear probing', 'Skip List', 'B+ Tree'],
    correctOptionIndex: 1,
    marks: 4,
  },
  {
    id: 'q3',
    text: 'In Deep Learning, what issue does the AdamW optimizer specifically fix over standard Adam with L2 regularization?',
    category: 'Machine Learning',
    options: [
      'Decouples weight decay directly from gradient moments updates',
      'Calculates exact second-order Hessian approximations',
      'Eliminates the requirement for learning rate warmup',
      'Normalizes gradient vectors across distributed GPU nodes',
    ],
    correctOptionIndex: 0,
    marks: 4,
  },
  {
    id: 'q4',
    text: 'What is the worst-case time complexity of QuickSelect when choosing the k-th smallest item with arbitrary pivot selection?',
    category: 'Data Structures & Algorithms',
    options: ['O(N log N)', 'O(N)', 'O(N²)', 'O(log N)'],
    correctOptionIndex: 2,
    marks: 4,
  },
  // Aptitude / Logical Questions
  {
    id: 'q5',
    text: 'A train 180 meters long is running at a speed of 54 km/h. How many seconds will it take to pass an electric pole?',
    category: 'Quantitative Aptitude',
    options: ['10 seconds', '12 seconds', '15 seconds', '18 seconds'],
    correctOptionIndex: 1, // 54 * (5/18) = 15 m/s. 180 / 15 = 12s
    marks: 4,
  },
  {
    id: 'q6',
    text: 'If 6 workers can complete a coding module in 14 days working 7 hours a day, how many days will 8 workers take working 7 hours a day?',
    category: 'Quantitative Aptitude',
    options: ['10.5 days', '11 days', '12 days', '14 days'],
    correctOptionIndex: 0, // (6 * 14) / 8 = 10.5 days
    marks: 4,
  },
  {
    id: 'q7',
    text: 'Statements: All algorithms are models. Some models are neural. Conclusion: (I) Some algorithms are neural. (II) All neural networks are algorithms.',
    category: 'Logical Reasoning',
    options: ['Only conclusion I follows', 'Only conclusion II follows', 'Either I or II follows', 'Neither I nor II follows'],
    correctOptionIndex: 3,
    marks: 4,
  },
  {
    id: 'q8',
    text: 'Pointing to a photograph, a candidate said: "He is the son of the only daughter of the father of my brother." How is the person related to the candidate?',
    category: 'Logical Reasoning',
    options: ['Nephew', 'Brother', 'Son', 'Uncle'],
    correctOptionIndex: 2, // Candidate's father's only daughter is candidate herself; her son is her son
    marks: 4,
  },
  {
    id: 'q9',
    text: 'In Parameter-Efficient Fine-Tuning (LoRA), parameter matrix W is adapted via ΔW = B · A. If W is 4096 × 4096 and rank r = 8, what fraction of weights is tuned?',
    category: 'Machine Learning',
    options: ['Approximately 0.39%', 'Approximately 5.0%', 'Approximately 12.5%', 'Approximately 0.05%'],
    correctOptionIndex: 0, // (4096*8 + 8*4096) / (4096*4096) = 65536 / 16777216 ≈ 0.39%
    marks: 4,
  },
  {
    id: 'q10',
    text: 'Which graph traversal algorithm guarantees finding the shortest path in an unweighted graph?',
    category: 'Data Structures & Algorithms',
    options: ['Depth-First Search (DFS)', 'Breadth-First Search (BFS)', 'Topological Sort', 'Tarjan\'s SCC'],
    correctOptionIndex: 1,
    marks: 4,
  },
];

export const SAMPLE_TESTS: TestInfo[] = [
  {
    id: 'test_ml_aptitude_2026',
    title: 'Trinetra Core Engineering & AI Assessment',
    description: 'High-stakes 10-question evaluation spanning ML architectures, algorithmic complexity, and analytical reasoning.',
    category: 'Computer Science & Aptitude',
    durationMinutes: 30,
    totalQuestions: 10,
    maxWarnings: 3,
    status: 'assigned',
    instructions: [
      'Maintain fullscreen kiosk mode throughout the test session.',
      'Webcam proctoring is live. Looking away or absence triggers automated warnings.',
      'Browser tabs are permitted for official reference, but AI-assistants (ChatGPT, Claude, etc.) are detected and flagged.',
      'Reaching 4 warnings results in automated test termination.',
      'Use keyboard shortcuts (1-4 for options, arrows to navigate, M to mark for review).',
    ],
  },
  {
    id: 'test_system_design',
    title: 'Distributed Systems & Cloud Architecture',
    description: 'Advanced evaluation of consensus protocols, caching strategies, and CAP theorem trade-offs.',
    category: 'Systems Engineering',
    durationMinutes: 45,
    totalQuestions: 15,
    maxWarnings: 3,
    status: 'assigned',
    instructions: [
      'Kiosk mode enforced.',
      'Single physical monitor only.',
      'No secondary devices allowed.',
    ],
  },
  {
    id: 'test_mock_practice',
    title: 'Diagnostic Practice Mock Test',
    description: 'A sandbox practice exam to calibrate your webcam, gaze detection, and tab navigation workflow.',
    category: 'Practice & Orientation',
    durationMinutes: 15,
    totalQuestions: 5,
    maxWarnings: 5,
    status: 'completed',
    score: 16,
    totalMarks: 20,
    instructions: ['Practice session with low penalty thresholds.'],
  },
];

export const SAMPLE_STUDENTS: StudentSummary[] = [
  {
    id: 'std_01',
    name: 'Alex Johnson',
    email: 'alex.j@institution.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'testing',
    riskScore: 'green',
    warningsCount: 0,
    currentTestTitle: 'Trinetra Core Engineering',
    lastSnapshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
    eventsCount: 3,
  },
  {
    id: 'std_02',
    name: 'Priya Sharma',
    email: 'priya.s@institution.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    status: 'testing',
    riskScore: 'amber',
    warningsCount: 2,
    currentTestTitle: 'Trinetra Core Engineering',
    lastSnapshotUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
    eventsCount: 14,
  },
  {
    id: 'std_03',
    name: 'David Kim',
    email: 'david.k@institution.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: 'disqualified',
    riskScore: 'red',
    warningsCount: 4,
    currentTestTitle: 'Trinetra Core Engineering',
    lastSnapshotUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
    eventsCount: 28,
  },
  {
    id: 'std_04',
    name: 'Sophia Patel',
    email: 'sophia.p@institution.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    status: 'submitted',
    riskScore: 'green',
    warningsCount: 0,
    currentTestTitle: 'Trinetra Core Engineering',
    lastSnapshotUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
    eventsCount: 5,
  },
  {
    id: 'std_05',
    name: 'Marcus Chen',
    email: 'marcus.c@institution.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    status: 'testing',
    riskScore: 'green',
    warningsCount: 1,
    currentTestTitle: 'Trinetra Core Engineering',
    lastSnapshotUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
    eventsCount: 8,
  },
  {
    id: 'std_06',
    name: 'Elena Rostova',
    email: 'elena.r@institution.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    status: 'online',
    riskScore: 'green',
    warningsCount: 0,
    currentTestTitle: 'Trinetra Core Engineering',
    lastSnapshotUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300',
    eventsCount: 0,
  },
  {
    id: 'std_07',
    name: 'Tariq Al-Mansoor',
    email: 'tariq.m@institution.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
    status: 'testing',
    riskScore: 'amber',
    warningsCount: 2,
    currentTestTitle: 'Trinetra Core Engineering',
    lastSnapshotUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300',
    eventsCount: 11,
  },
  {
    id: 'std_08',
    name: 'Chloe Dubois',
    email: 'chloe.d@institution.edu',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    status: 'submitted',
    riskScore: 'green',
    warningsCount: 0,
    currentTestTitle: 'Trinetra Core Engineering',
    lastSnapshotUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300',
    eventsCount: 2,
  },
];

export const SAMPLE_ACTIVITY_TIMELINE: ActivityLogItem[] = [
  {
    id: 'act_1',
    timestamp: Date.now() - 120000,
    formattedTime: '14:31:58',
    action: 'OPENED_TAB',
    domain: 'chatgpt.com',
    title: 'ChatGPT - Prompt Engineering',
    category: 'AI_TOOL',
  },
  {
    id: 'act_2',
    timestamp: Date.now() - 105000,
    formattedTime: '14:32:11',
    action: 'SEARCHED',
    domain: 'chatgpt.com',
    query: 'Solve: In Transformer attention what is complexity of sequence length L?',
    category: 'AI_TOOL',
  },
  {
    id: 'act_3',
    timestamp: Date.now() - 50000,
    formattedTime: '14:33:05',
    action: 'CLOSED_TAB',
    domain: 'chatgpt.com',
    durationSec: 67,
    category: 'AI_TOOL',
  },
  {
    id: 'act_4',
    timestamp: Date.now() - 30000,
    formattedTime: '14:34:20',
    action: 'OPENED_TAB',
    domain: 'en.wikipedia.org',
    title: 'Time complexity - Wikipedia',
    category: 'OTHER',
  },
  {
    id: 'act_5',
    timestamp: Date.now() - 15000,
    formattedTime: '14:34:42',
    action: 'SEARCHED',
    domain: 'google.com',
    query: 'FlashAttention tile memory latency',
    category: 'SEARCH',
  },
];

const mockAnalytics: StudentAnalytics = {
  studentId: 'usr_candidate_01',
  scoreTrend: [
    { testName: 'Diagnostic', score: 16, maxScore: 20 },
    { testName: 'Data Structs', score: 28, maxScore: 40 },
    { testName: 'Aptitude II', score: 36, maxScore: 40 },
    { testName: 'Core AI', score: 32, maxScore: 40 },
  ],
  topicScores: [
    { topic: 'Machine Learning', score: 12, total: 16 },
    { topic: 'Algorithms', score: 12, total: 12 },
    { topic: 'Quantitative', score: 8, total: 8 },
    { topic: 'Logical', score: 4, total: 4 },
  ],
  skillRadar: [
    { subject: 'Attention & LLMs', value: 92 },
    { subject: 'Memory Optimization', value: 85 },
    { subject: 'Complexity Analysis', value: 88 },
    { subject: 'Speed Math', value: 95 },
    { subject: 'Deductive Logic', value: 80 },
  ],
  integrityScore: 98,
  totalViolations: 1,
};

const activeSessions: Map<string, SessionStatus> = new Map();
const inMemoryAnswers: Map<string, AnswerRecord> = new Map();

const delay = (ms: number = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  async sendOtp(_email: string) {
    await delay(300);
    return {
      success: true,
      message: 'One-time passcode sent to registered email address.',
      expiresInSeconds: 30,
    };
  },

  async verifyOtp(email: string, otp: string) {
    await delay(350);
    if (otp.length === 6 && /^\d+$/.test(otp)) {
      const user: User = {
        id: 'usr_candidate_01',
        email,
        name: email.split('@')[0].toUpperCase(),
        registeredPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        role: email.includes('admin') || email.includes('examiner') ? 'examiner' : 'student',
      };
      return { success: true, user, message: 'Authentication verified.' };
    }
    return { success: false, message: 'Invalid or expired OTP code.' };
  },

  async verifyFace(_userId: string, liveImageUri: string) {
    await delay(600);
    if (!liveImageUri || liveImageUri.length < 50) {
      return { verified: false, confidence: 0, message: 'Face not centered.' };
    }
    return { verified: true, confidence: 0.98, message: 'Face match verified.' };
  },

  async createSession(userId: string, deviceId: string) {
    await delay(200);
    const existing = activeSessions.get(userId);
    if (existing && existing.isActive && existing.activeDeviceId !== deviceId) {
      return {
        success: false,
        message: 'Active session already running on another workstation.',
        session: existing,
      };
    }
    const session: SessionStatus = {
      sessionId: `trinetra_sess_${Date.now()}`,
      userId,
      isActive: true,
      activeDeviceId: deviceId,
      lastHeartbeat: new Date().toISOString(),
    };
    activeSessions.set(userId, session);
    return { success: true, session, message: 'Session initiated.' };
  },

  async signOutOtherSession(userId: string) {
    await delay(300);
    activeSessions.delete(userId);
    return { success: true };
  },

  async fetchTests(_userId: string) {
    await delay(250);
    return [...SAMPLE_TESTS];
  },

  async fetchQuestions(_testId: string) {
    await delay(250);
    return [...SAMPLE_QUESTIONS];
  },

  async saveAnswer(sessionId: string, answer: AnswerRecord) {
    inMemoryAnswers.set(`${sessionId}_${answer.questionId}`, {
      ...answer,
      synced: true,
    });
    return { success: true };
  },

  async logEvent(events: ProctorEvent[]) {
    return { count: events.length, success: true };
  },

  async uploadSnapshot(_sessionId: string, _dataUri: string) {
    await delay(200);
    return { success: true, snapshotUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300' };
  },

  async submitTest(
    _sessionId: string,
    answers: AnswerRecord[],
    disqualified: boolean = false,
    warningsCount: number = 0
  ): Promise<SubmissionResponse> {
    await delay(500);

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let skippedCount = 0;

    SAMPLE_QUESTIONS.forEach((q) => {
      const ans = answers.find((a) => a.questionId === q.id);
      if (!ans || ans.selectedOption === null) {
        skippedCount++;
      } else if (ans.selectedOption === q.correctOptionIndex) {
        correctCount++;
        score += q.marks;
      } else {
        wrongCount++;
      }
    });

    if (disqualified) score = 0;

    return {
      success: true,
      score,
      totalMarks: SAMPLE_QUESTIONS.length * 4,
      correctCount,
      wrongCount,
      skippedCount,
      timeSpentSec: 720,
      submittedAt: new Date().toISOString(),
      integritySummary: {
        warningsIssued: warningsCount,
        integrityRating: disqualified ? 'Compromised' : warningsCount > 0 ? 'Minor Flags' : 'Clean',
        riskRating: disqualified ? 'High' : warningsCount > 1 ? 'Medium' : 'Low',
      },
      message: disqualified
        ? 'Test automatically terminated due to policy violations.'
        : 'Assessment completed and stored securely.',
    };
  },

  async getAnalytics(_studentId: string): Promise<StudentAnalytics> {
    await delay(200);
    return mockAnalytics;
  },

  async fetchAllStudents(): Promise<StudentSummary[]> {
    await delay(200);
    return [...SAMPLE_STUDENTS];
  },
};
