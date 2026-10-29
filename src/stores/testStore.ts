import { create } from 'zustand';
import { TestInfo, Question, AnswerRecord, SubmissionResponse } from '@/types/api';
import { mockApi } from '@/services/api/mockApi';
import { db } from '@/services/db/dexieDb';

interface TestState {
  currentTest: TestInfo | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<string, AnswerRecord>;
  timeRemainingSeconds: number;
  isTimerRunning: boolean;
  isAutosaving: boolean;
  lastSavedAt: number | null;
  isSubmitting: boolean;
  submissionResult: SubmissionResponse | null;
  isTestCompleted: boolean;
  isTimeUp: boolean;

  initTest: (test: TestInfo) => Promise<void>;
  selectOption: (questionId: string, optionIndex: number) => void;
  clearResponse: (questionId: string) => void;
  toggleMarkForReview: (questionId: string) => void;
  goToQuestion: (index: number) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  tickTimer: () => void;
  submitTest: (disqualified?: boolean, warningsCount?: number) => Promise<SubmissionResponse | null>;
  resetTest: () => void;
}

export const useTestStore = create<TestState>((set, get) => ({
  currentTest: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  timeRemainingSeconds: 30 * 60,
  isTimerRunning: false,
  isAutosaving: false,
  lastSavedAt: null,
  isSubmitting: false,
  submissionResult: null,
  isTestCompleted: false,
  isTimeUp: false,

  initTest: async (test: TestInfo) => {
    const questions = await mockApi.fetchQuestions(test.id);
    const initialAnswers: Record<string, AnswerRecord> = {};

    questions.forEach((q) => {
      initialAnswers[q.id] = {
        questionId: q.id,
        selectedOption: null,
        isMarkedForReview: false,
        timestamp: Date.now(),
        synced: true,
      };
    });

    set({
      currentTest: test,
      questions,
      currentQuestionIndex: 0,
      answers: initialAnswers,
      timeRemainingSeconds: test.durationMinutes * 60,
      isTimerRunning: true,
      isTestCompleted: false,
      isTimeUp: false,
      submissionResult: null,
    });
  },

  selectOption: async (questionId: string, optionIndex: number) => {
    const currentAns = get().answers[questionId];
    const updated: AnswerRecord = {
      questionId,
      selectedOption: optionIndex,
      isMarkedForReview: currentAns?.isMarkedForReview || false,
      timestamp: Date.now(),
      synced: false,
    };

    set((state) => ({
      answers: { ...state.answers, [questionId]: updated },
      isAutosaving: true,
    }));

    // Autosave to IndexedDB
    try {
      const testId = get().currentTest?.id || 'default_test';
      await db.answers.put({ ...updated, testId });
      await mockApi.saveAnswer(testId, updated);
      set({ isAutosaving: false, lastSavedAt: Date.now() });
    } catch {
      set({ isAutosaving: false });
    }
  },

  clearResponse: async (questionId: string) => {
    const currentAns = get().answers[questionId];
    const updated: AnswerRecord = {
      questionId,
      selectedOption: null,
      isMarkedForReview: currentAns?.isMarkedForReview || false,
      timestamp: Date.now(),
      synced: false,
    };

    set((state) => ({
      answers: { ...state.answers, [questionId]: updated },
      isAutosaving: true,
    }));

    try {
      const testId = get().currentTest?.id || 'default_test';
      await db.answers.put({ ...updated, testId });
      await mockApi.saveAnswer(testId, updated);
      set({ isAutosaving: false, lastSavedAt: Date.now() });
    } catch {
      set({ isAutosaving: false });
    }
  },

  toggleMarkForReview: (questionId: string) => {
    const current = get().answers[questionId];
    if (!current) return;
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: {
          ...current,
          isMarkedForReview: !current.isMarkedForReview,
          timestamp: Date.now(),
        },
      },
    }));
  },

  goToQuestion: (index: number) => {
    const max = get().questions.length - 1;
    if (index >= 0 && index <= max) {
      set({ currentQuestionIndex: index });
    }
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  tickTimer: () => {
    const { timeRemainingSeconds, isTimerRunning } = get();
    if (!isTimerRunning) return;

    if (timeRemainingSeconds <= 1) {
      set({ timeRemainingSeconds: 0, isTimerRunning: false, isTimeUp: true });
      get().submitTest(false);
    } else {
      set({ timeRemainingSeconds: timeRemainingSeconds - 1 });
    }
  },

  submitTest: async (disqualified = false, warningsCount = 0) => {
    set({ isSubmitting: true, isTimerRunning: false });
    const { currentTest, answers } = get();
    const sessionId = currentTest?.id || 'trinetra_session';

    const answerList = Object.values(answers);
    const result = await mockApi.submitTest(sessionId, answerList, disqualified, warningsCount);

    set({
      submissionResult: result,
      isSubmitting: false,
      isTestCompleted: true,
    });
    return result;
  },

  resetTest: () => {
    set({
      currentTest: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      isTimerRunning: false,
      submissionResult: null,
      isTestCompleted: false,
      isTimeUp: false,
    });
  },
}));

