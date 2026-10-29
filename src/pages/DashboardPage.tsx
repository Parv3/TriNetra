import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useTestStore } from '@/stores/testStore';
import { mockApi } from '@/services/api/mockApi';
import { TestInfo } from '@/types/api';
import { TrinetraLogo } from '@/components/common/TrinetraLogo';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
  Clock,
  HelpCircle,
  FileCheck,
  Play,
  CheckCircle2,
  LogOut,
  Info,
  Shield,
  ArrowRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { initTest } = useTestStore();

  const [tests, setTests] = useState<TestInfo[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestInfo | null>(null);

  useEffect(() => {
    mockApi.fetchTests(user?.id || 'usr_candidate_01').then((res) => {
      setTests(res);
      if (res.length > 0) setSelectedTest(res[0]);
    });
  }, [user]);

  const handleStartTest = async (test: TestInfo) => {
    await initTest(test);
    navigate('/test');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col selection:bg-cyan-500/20">
      {/* Top Bar */}
      <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
        <TrinetraLogo size="md" />

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 text-right">
            <div>
              <div className="text-xs font-bold text-foreground">{user?.name || 'ALEX JOHNSON'}</div>
              <div className="text-[10px] text-muted-foreground">{user?.email || 'candidate@example.com'}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#5B4BFF]/20 text-[#5B4BFF] font-bold text-xs flex items-center justify-center border border-[#5B4BFF]/30">
              {user?.name?.[0] || 'A'}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="text-xs gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto w-full p-6 sm:p-8 space-y-8 flex-1">
        {/* Welcome Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#5B4BFF]/10 via-[#19D3F3]/10 to-transparent border border-[#5B4BFF]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold font-heading text-foreground">
              Candidate Examination Portal
            </h1>
            <p className="text-xs text-muted-foreground">
              Select an assigned assessment below to review instructions and start proctoring.
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <Shield className="w-4 h-4 text-emerald-500" />
            Workstation Diagnostics Passed
          </div>
        </div>

        {/* Tests Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List of Test Cards */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-base font-bold font-heading text-foreground">
              Assigned Assessments ({tests.length})
            </h2>

            <div className="space-y-3.5">
              {tests.map((test) => {
                const isSelected = selectedTest?.id === test.id;
                const isCompleted = test.status === 'completed';

                return (
                  <Card
                    key={test.id}
                    onClick={() => setSelectedTest(test)}
                    className={`cursor-pointer transition-all p-5 rounded-2xl border-2 ${
                      isSelected
                        ? 'border-[#5B4BFF] bg-[#5B4BFF]/5 shadow-sm'
                        : 'border-border/80 hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5B4BFF]">
                            {test.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isCompleted
                                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                : 'bg-[#5B4BFF]/10 text-[#5B4BFF] border border-[#5B4BFF]/20'
                            }`}
                          >
                            {isCompleted ? 'Completed' : 'Available'}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-foreground font-heading">
                          {test.title}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {test.description}
                        </p>

                        <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-primary" />
                            {test.durationMinutes} minutes
                          </span>
                          <span className="flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-primary" />
                            {test.totalQuestions} questions
                          </span>
                          {isCompleted && test.score !== undefined && (
                            <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                              <FileCheck className="w-3.5 h-3.5" />
                              Score: {test.score}/{test.totalMarks}
                            </span>
                          )}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={isSelected ? 'primary' : 'outline'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartTest(test);
                        }}
                        className={`gap-1.5 ${isSelected ? 'bg-gradient-trinetra text-white border-0' : ''}`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        {isCompleted ? 'Retake Demo' : 'Start Test'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Test Detail / Instructions Drawer */}
          <div className="md:col-span-1">
            {selectedTest && (
              <Card className="p-5 rounded-2xl space-y-4 border-border/80 sticky top-20">
                <div className="flex items-center gap-2 pb-2 border-b border-border">
                  <Info className="w-4 h-4 text-[#5B4BFF]" />
                  <h3 className="text-sm font-bold font-heading text-foreground">
                    Test Guidelines
                  </h3>
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-foreground">{selectedTest.title}</h4>
                  <p className="text-xs text-muted-foreground">{selectedTest.description}</p>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground block">
                    Security Instructions
                  </span>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {selectedTest.instructions.map((ins, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{ins}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleStartTest(selectedTest)}
                  className="w-full gap-2 bg-gradient-trinetra text-white border-0 font-semibold shadow-md shadow-[#5B4BFF]/20 mt-4"
                >
                  Begin Assessment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
