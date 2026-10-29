import { getOrCreateBackendSession, logIntegrityEvent } from '@/services/api/realApi';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestStore } from '@/stores/testStore';
import { useAuthStore } from '@/stores/authStore';
import { useProctorStore } from '@/stores/proctorStore';
import { useBrowserStore } from '@/stores/browserStore';
import { SAMPLE_TESTS } from '@/services/api/mockApi';
import { TrinetraLogo } from '@/components/common/TrinetraLogo';
import { Button } from '@/components/common/Button';
import { QuestionPalette } from '@/components/test/QuestionPalette';
import { WebcamOverlay } from '@/components/test/WebcamOverlay';
import { WarningModal } from '@/components/test/WarningModal';
import { SubmitModal } from '@/components/test/SubmitModal';
import { ViolationsDrawer } from '@/components/test/ViolationsDrawer';
import { BrowserViewport } from '@/components/browser/BrowserViewport';
import { ActivityTrackerPanel } from '@/components/browser/ActivityTrackerPanel';
import {
  Clock,
  ShieldAlert,
  Wifi,
  WifiOff,
  Check,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  RotateCcw,
  Send,
  AlertCircle,
  FileCheck,
  Lock,
  Plus,
  X,
  Globe,
  Activity,
  Minus,
  Square,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

export const TestEnvironmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, session } = useAuthStore();

  // Ensure session is synchronized with backend database upon entering test
  useEffect(() => {
    getOrCreateBackendSession(user?.name, user?.id).then((sess) => {
      if (sess && (!session || session.sessionId !== sess.id)) {
        useAuthStore.setState({
          session: {
            sessionId: sess.id,
            userId: user?.id || 'usr_candidate_01',
            isActive: true,
            activeDeviceId: 'dev_primary',
            lastHeartbeat: new Date().toISOString(),
          },
        });
      }
    });
  }, [user]);

  const {
    currentTest,
    questions,
    currentQuestionIndex,
    answers,
    timeRemainingSeconds,
    isTimerRunning,
    isAutosaving,
    isTestCompleted,
    submissionResult,
    initTest,
    selectOption,
    clearResponse,
    toggleMarkForReview,
    nextQuestion,
    prevQuestion,
    tickTimer,
    submitTest,
  } = useTestStore();

  const {
    warningsCount,
    maxWarnings,
    riskLevel,
    reportViolation,
  } = useProctorStore();

  const {
    tabs,
    activeTabId,
    setActiveTab,
    openNewTab,
    closeTab,
    toggleActivityTracker,
    returnToTest,
  } = useBrowserStore();

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isViolationsDrawerOpen, setIsViolationsDrawerOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    if (!currentTest) {
      initTest(SAMPLE_TESTS[0]);
    }
  }, [currentTest, initTest]);

  // Network listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Timer interval
  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, tickTimer]);

  // Keyboard navigation & security shortcuts
  const currentQ = questions[currentQuestionIndex];

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (isSubmitModalOpen || isViolationsDrawerOpen) return;

      // Escape key returns to test
      if (e.key === 'Escape' && activeTabId !== 'test') {
        returnToTest();
        return;
      }

      // If active tab is test, handle 1-4, arrows, M
      if (activeTabId === 'test') {
        if (['1', '2', '3', '4'].includes(e.key) && currentQ) {
          const optionIdx = parseInt(e.key, 10) - 1;
          if (optionIdx < currentQ.options.length) {
            selectOption(currentQ.id, optionIdx);
          }
        } else if (e.key === 'ArrowRight') {
          nextQuestion();
        } else if (e.key === 'ArrowLeft') {
          prevQuestion();
        } else if (e.key === 'm' || e.key === 'M') {
          if (currentQ) toggleMarkForReview(currentQ.id);
        }
      }
    },
    [isSubmitModalOpen, isViolationsDrawerOpen, activeTabId, returnToTest, currentQ, selectOption, nextQuestion, prevQuestion, toggleMarkForReview]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Security handlers: right-click, window blur, text copying
  useEffect(() => {
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      reportViolation('SUSPICIOUS_SHORTCUT', 'Right-click context menu is locked in proctored browser.', false);
    };
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      reportViolation('SUSPICIOUS_SHORTCUT', 'System clipboard is restricted during assessment.', false);
    };

    const handleWindowBlur = () => {
      reportViolation('WINDOW_BLUR', 'Workstation focus lost. Window blur detected.', false);
      const sId = session?.sessionId || localStorage.getItem('spb_session_id') || 'active_session';
      logIntegrityEvent(sId, 'WINDOW_BLUR', { message: 'Window focus switch attempt' });
    };

    window.addEventListener('contextmenu', preventContextMenu);
    window.addEventListener('copy', preventCopy);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('contextmenu', preventContextMenu);
      window.removeEventListener('copy', preventCopy);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [reportViolation]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitModalOpen(false);
    await submitTest(false, warningsCount);
  };

  const handleDisqualificationAutoSubmit = async () => {
    await submitTest(true, warningsCount);
  };

  if (isTestCompleted && submissionResult) {
    const isDisqualified = submissionResult.integritySummary.integrityRating === 'Compromised';

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 select-none">
        <div className="w-full max-w-xl bg-card border border-border rounded-2xl p-8 shadow-2xl text-center space-y-6">
          <div
            className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center ${
              isDisqualified
                ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
            }`}
          >
            {isDisqualified ? <AlertCircle className="w-8 h-8" /> : <FileCheck className="w-8 h-8" />}
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold font-heading text-foreground">
              {isDisqualified ? 'Examination Terminated' : 'Assessment Submitted'}
            </h1>
            <p className="text-sm text-muted-foreground">{submissionResult.message}</p>
          </div>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-muted/40 border border-border text-xs">
            <div>
              <span className="text-muted-foreground block mb-1">Total Score</span>
              <span className="text-lg font-bold text-foreground font-heading">
                {submissionResult.score} / {submissionResult.totalMarks}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">Integrity Rating</span>
              <span
                className={`font-semibold ${
                  isDisqualified
                    ? 'text-rose-500'
                    : submissionResult.integritySummary.warningsIssued > 0
                    ? 'text-amber-500'
                    : 'text-emerald-500'
                }`}
              >
                {submissionResult.integritySummary.integrityRating}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block mb-1">Total Warnings</span>
              <span className="text-lg font-bold text-foreground font-heading">
                {submissionResult.integritySummary.warningsIssued}
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                useTestStore.getState().resetTest();
                navigate('/dashboard');
              }}
              className="flex-1"
            >
              Return to Dashboard
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                useTestStore.getState().resetTest();
                navigate('/');
              }}
              className="flex-1 bg-gradient-trinetra text-white border-0"
            >
              Exit to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Initializing secured examination environment...</p>
      </div>
    );
  }

  const currentAns = answers[currentQ.id];
  const selectedOption = currentAns?.selectedOption;
  const isMarked = currentAns?.isMarkedForReview || false;
  const optionLetters = ['A', 'B', 'C', 'D'];

  const activeBrowserTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden select-none">
      {/* 1. Proctored App Shell Top Header & Native Controls */}
      <div className="h-8 bg-slate-950 text-slate-400 border-b border-slate-800 px-3 flex items-center justify-between text-[11px] font-mono select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-slate-200">TRINETRA PROCTOR BROWSER SHELL</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">KIOSK MODE: LOCKED</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> HW_SANDBOX: ACTIVE
          </span>
        </div>

        {/* Windows-style Native Window Controls (Locked) */}
        <div className="flex items-center gap-3">
          <span className="text-cyan-400 font-semibold text-[10px] hidden sm:inline shrink-0">
            SESSION: {session?.sessionId || localStorage.getItem('spb_session_id') || 'INITIALIZING'}
          </span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-300 text-[10px] font-semibold uppercase truncate max-w-[140px]" title={user?.name || 'ALEX JOHNSON'}>
            CANDIDATE: {user?.name || 'ALEX JOHNSON'}
          </span>
          <button
            disabled
            className="p-1 text-slate-600 cursor-not-allowed"
            title="Minimize disabled in proctor mode"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            disabled
            className="p-1 text-slate-600 cursor-not-allowed"
            title="Window resize locked in kiosk mode"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="p-1 text-rose-400 hover:bg-rose-500/20 rounded transition-colors"
            title="End Examination and Submit"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Top Browser Tab Strip & Telemetry Chips */}
      <header className="h-12 bg-card border-b border-border px-3 flex items-center justify-between shrink-0 z-30">
        {/* Left: Tab Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[65vw] py-1 scrollbar-none">
          <TrinetraLogo size="sm" showText={false} className="mr-1" />

          {/* Locked Test Tab */}
          <button
            onClick={() => setActiveTab('test')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTabId === 'test'
                ? 'bg-[#5B4BFF] text-white shadow-xs'
                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <Lock className="w-3 h-3" />
            <span>Assessment</span>
            {activeTabId === 'test' && (
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
          </button>

          {/* Dynamic Smart Browser Tabs */}
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            const isAi = tab.category === 'AI_TOOL';

            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all max-w-[180px] border ${
                  isActive
                    ? 'bg-card border-primary text-foreground shadow-xs'
                    : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted'
                }`}
              >
                {isAi ? (
                  <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                ) : (
                  <Globe className="w-3 h-3 text-cyan-500 shrink-0" />
                )}
                <span className="truncate font-medium">{tab.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="p-0.5 rounded hover:bg-muted hover:text-foreground text-muted-foreground shrink-0"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* New Tab Button */}
          <button
            onClick={() => openNewTab()}
            className="p-1.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Open In-App Smart Browser Tab (Audited)"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right Header Chips */}
        <div className="flex items-center gap-2.5">
          {/* Activity Tracker Side Panel Trigger */}
          <Button
            size="sm"
            variant="outline"
            onClick={toggleActivityTracker}
            className="gap-1.5 h-8 text-xs font-semibold border-cyan-500/40 text-cyan-600 dark:text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-500" />
            Activity Tracker
          </Button>

          {/* Timer Countdown */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono text-xs font-bold ${
              timeRemainingSeconds < 300
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-500'
                : 'border-border bg-muted/40 text-foreground'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(timeRemainingSeconds)}</span>
          </div>

          {/* Warnings Badge */}
          <button
            onClick={() => setIsViolationsDrawerOpen(true)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-semibold transition-colors ${
              warningsCount > 0
                ? 'border-rose-500/40 bg-rose-500/10 text-rose-500'
                : 'border-border bg-muted/40 text-muted-foreground hover:text-foreground'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{warningsCount}/{maxWarnings}</span>
          </button>

          {/* Risk Ring */}
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${
              riskLevel === 'green'
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                : riskLevel === 'amber'
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                : 'bg-rose-500/10 text-rose-500 border-rose-500/20 animate-risk-pulse'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                riskLevel === 'green'
                  ? 'bg-emerald-500'
                  : riskLevel === 'amber'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            {riskLevel}
          </div>

          {/* Online / Offline Dot */}
          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-500" />
            )}
          </div>
        </div>
      </header>

      {/* 3. Main Body: Either Test View or Smart Browser Tab */}
      <div className="flex-1 flex overflow-hidden">
        {activeTabId === 'test' ? (
          /* Locked Examination MCQ Area */
          <>
            <main className="flex-1 flex flex-col p-6 sm:p-8 overflow-y-auto max-w-4xl mx-auto w-full">
              {/* Question Metadata & Category */}
              <div className="flex items-center justify-between pb-4 border-b border-border/70 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary uppercase tracking-wider">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium text-[11px]">
                    {currentQ.category}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    {isAutosaving ? (
                      <span>Saving...</span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-500 font-medium">
                        <Check className="w-3.5 h-3.5" /> Autosaved
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-foreground">+{currentQ.marks} marks</span>
                </div>
              </div>

              {/* Question Text (at 20px) */}
              <div className="py-6">
                <h2 className="text-lg sm:text-[20px] font-medium leading-relaxed text-foreground break-words overflow-wrap-anywhere select-text">
                  {currentQ.text}
                </h2>
              </div>

              {/* 4 Large Option Cards */}
              <div className="space-y-3.5 flex-1">
                {currentQ.options.map((optionText, optIdx) => {
                  const isSelected = selectedOption === optIdx;

                  return (
                    <div
                      key={optIdx}
                      role="button"
                      tabIndex={0}
                      onClick={() => selectOption(currentQ.id, optIdx)}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          selectOption(currentQ.id, optIdx);
                        }
                      }}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                        isSelected
                          ? 'border-[#5B4BFF] bg-[#5B4BFF]/5 shadow-sm'
                          : 'border-border/80 bg-card hover:border-primary/40 hover:bg-muted/20'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg font-bold text-sm flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#5B4BFF] text-white shadow-xs'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {optionLetters[optIdx]}
                      </div>

                      <span className="text-sm sm:text-base font-normal text-foreground leading-relaxed flex-1 break-words min-w-0">
                        {optionText}
                      </span>

                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-[#5B4BFF] text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action Bar */}
              <div className="pt-6 border-t border-border/70 flex flex-wrap items-center justify-between gap-3 mt-auto">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="gap-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    onClick={nextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                    className="gap-1.5"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2.5">
                  <Button
                    variant={isMarked ? 'secondary' : 'outline'}
                    size="md"
                    onClick={() => toggleMarkForReview(currentQ.id)}
                    className={`gap-1.5 ${isMarked ? 'text-[#5B4BFF] font-semibold' : ''}`}
                  >
                    <Bookmark className={`w-4 h-4 ${isMarked ? 'fill-[#5B4BFF]' : ''}`} />
                    {isMarked ? 'Marked' : 'Mark for Review'}
                  </Button>

                  {selectedOption !== null && (
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => clearResponse(currentQ.id)}
                      className="gap-1.5 text-muted-foreground hover:text-rose-500"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Clear
                    </Button>
                  )}

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsSubmitModalOpen(true)}
                    className="gap-2 bg-gradient-trinetra text-white border-0 font-semibold shadow-md shadow-[#5B4BFF]/20"
                  >
                    <Send className="w-4 h-4" />
                    Submit Assessment
                  </Button>
                </div>
              </div>
            </main>

            {/* Question Palette Sidebar */}
            <aside className="hidden lg:block">
              <QuestionPalette />
            </aside>
          </>
        ) : activeBrowserTab ? (
          /* Active Smart Browser Tab Viewport */
          <BrowserViewport tab={activeBrowserTab} />
        ) : null}
      </div>

      {/* 4. Bottom Proctored Status Bar */}
      <footer className="h-7 bg-card border-t border-border px-4 flex items-center justify-between text-[10px] text-muted-foreground shrink-0 font-mono select-none">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Terminal className="w-3 h-3 text-[#5B4BFF]" />
            SESSION: #{session?.sessionId ? (session.sessionId.length > 20 ? session.sessionId.substring(0, 18) + '...' : session.sessionId) : (localStorage.getItem('spb_session_id') || 'ACTIVE')}
          </span>
          <span className="hidden sm:inline">DISPLAYS: 1 PRIMARY (MULTIPLE BLOCKED)</span>
          <span className="hidden md:inline">DEVTOOLS: DISABLED</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-emerald-500 font-semibold flex items-center gap-1">
            <Check className="w-3 h-3" /> TELEMETRY STREAMING
          </span>
          <span>AUTOSAVE: INDEXEDDB_V1</span>
        </div>
      </footer>

      {/* Floating Proctor Webcam HUD */}
      <WebcamOverlay />

      {/* Activity Tracker Side Drawer */}
      <ActivityTrackerPanel />

      {/* Warning Alert Modal */}
      <WarningModal onAutoSubmitDisqualification={handleDisqualificationAutoSubmit} />

      {/* Submit Confirmation Modal */}
      <SubmitModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleConfirmSubmit}
      />

      {/* Violations Drawer */}
      <ViolationsDrawer
        isOpen={isViolationsDrawerOpen}
        onClose={() => setIsViolationsDrawerOpen(false)}
      />
    </div>
  );
};
