import { create } from 'zustand';
import { ProctorEvent, ProctorViolationType } from '@/types/api';
import { mockApi } from '@/services/api/mockApi';
import { PROCTORING_CONFIG } from '@/config/proctoring.config';

export interface ViolationRecord {
  id: string;
  type: ProctorViolationType;
  title: string;
  reason: string;
  timestamp: number;
  formattedTime: string;
  severity: 'minor' | 'major';
}

interface ProctorState {
  warningsCount: number;
  maxWarnings: number;
  riskLevel: 'green' | 'amber' | 'red';
  isWebcamActive: boolean;
  webcamStatus: 'ok' | 'caution' | 'violation';
  violations: ViolationRecord[];
  activeWarningModal: ViolationRecord | null;
  isDisqualified: boolean;
  disqualificationReason: string | null;
  lastSnapshotTime: number;

  setWebcamActive: (active: boolean) => void;
  reportViolation: (type: ProctorViolationType, reason: string, isMajor?: boolean) => void;
  dismissWarningModal: () => void;
  resetProctoring: () => void;
}

export const useProctorStore = create<ProctorState>((set, get) => ({
  warningsCount: 0,
  maxWarnings: PROCTORING_CONFIG.maxWarnings, // 3 warnings, 4th = auto-disqualify
  riskLevel: 'green',
  isWebcamActive: false,
  webcamStatus: 'ok',
  violations: [],
  activeWarningModal: null,
  isDisqualified: false,
  disqualificationReason: null,
  lastSnapshotTime: Date.now(),

  setWebcamActive: (active: boolean) => set({ isWebcamActive: active }),

  reportViolation: async (type: ProctorViolationType, reason: string, isMajor = false) => {
    const { warningsCount, maxWarnings, isDisqualified } = get();
    if (isDisqualified) return;

    const newCount = warningsCount + 1;
    const now = new Date();
    const formattedTime = now.toTimeString().split(' ')[0];

    const violation: ViolationRecord = {
      id: `viol_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type,
      title: type.replace(/_/g, ' '),
      reason,
      timestamp: Date.now(),
      formattedTime,
      severity: isMajor ? 'major' : 'minor',
    };

    let nextRisk: 'green' | 'amber' | 'red' = 'green';
    if (newCount === 1 || newCount === 2) nextRisk = 'amber';
    if (newCount >= 3) nextRisk = 'red';

    const willDisqualify = newCount > maxWarnings;

    set((state) => ({
      warningsCount: newCount,
      riskLevel: nextRisk,
      webcamStatus: willDisqualify ? 'violation' : nextRisk === 'amber' ? 'caution' : 'ok',
      violations: [violation, ...state.violations],
      activeWarningModal: isMajor || willDisqualify ? violation : state.activeWarningModal,
      isDisqualified: willDisqualify,
      disqualificationReason: willDisqualify
        ? `Exceeded permitted warning quota (${newCount}/${maxWarnings}). Automated proctoring policy violation.`
        : null,
    }));

    // Log to API / IndexedDB
    const eventPayload: ProctorEvent = {
      sessionId: 'trinetra_active_session',
      type,
      severity: isMajor ? 'violation' : 'warning',
      timestamp: Date.now(),
      details: { reason, warningsCount: newCount },
    };
    await mockApi.logEvent([eventPayload]);
  },

  dismissWarningModal: () => set({ activeWarningModal: null }),

  resetProctoring: () =>
    set({
      warningsCount: 0,
      riskLevel: 'green',
      webcamStatus: 'ok',
      violations: [],
      activeWarningModal: null,
      isDisqualified: false,
      disqualificationReason: null,
    }),
}));

