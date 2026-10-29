export interface ProctoringConfig {
  maxWarnings: number;
  faceCheckIntervalMs: number;
  eyesOffScreenThresholdSec: number;
  headTurnYawAngleThresholdDeg: number;
  headTurnPitchAngleThresholdDeg: number;
  faceAbsenceGracePeriodSec: number;
  snapshotCaptureIntervalSec: number;
  batchLogIntervalSec: number;
  maxDisallowedDisplays: number;
  restrictedDomains: string[];
}

export const PROCTORING_CONFIG: ProctoringConfig = {
  maxWarnings: 3,
  faceCheckIntervalMs: 500,
  eyesOffScreenThresholdSec: 4.0,
  headTurnYawAngleThresholdDeg: 28,
  headTurnPitchAngleThresholdDeg: 25,
  faceAbsenceGracePeriodSec: 3.5,
  snapshotCaptureIntervalSec: 30,
  batchLogIntervalSec: 10,
  maxDisallowedDisplays: 1, // Only 1 primary monitor allowed
  restrictedDomains: [
    'chatgpt.com',
    'claude.ai',
    'gemini.google.com',
    'copilot.microsoft.com',
    'perplexity.ai',
    'poe.com',
    'chat.deepseek.com',
    'stackexchange.com',
    'stackoverflow.com',
    'github.com',
    'quora.com',
    'chegg.com',
  ],
};

