import React from 'react';
import { useTestStore } from '@/stores/testStore';
import { Bookmark, Check } from 'lucide-react';

export const QuestionPalette: React.FC = () => {
  const { questions, currentQuestionIndex, answers, goToQuestion } = useTestStore();

  const getQuestionState = (index: number) => {
    const q = questions[index];
    const ans = answers[q.id];
    const isAnswered = ans && ans.selectedOption !== null;
    const isMarked = ans && ans.isMarkedForReview;
    const isCurrent = currentQuestionIndex === index;

    return { isAnswered, isMarked, isCurrent };
  };

  const answeredCount = Object.values(answers).filter((a) => a.selectedOption !== null).length;
  const markedCount = Object.values(answers).filter((a) => a.isMarkedForReview).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <div className="w-72 bg-card border-l border-border flex flex-col h-full shrink-0 select-none">
      <div className="p-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Question Navigator</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Click or use Arrow keys to jump</p>
      </div>

      {/* Grid of Questions */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="grid grid-cols-5 gap-2.5">
          {questions.map((q, idx) => {
            const { isAnswered, isMarked, isCurrent } = getQuestionState(idx);

            let shapeClass = 'rounded-md'; // Default square for unanswered
            let colorClass = 'bg-muted text-muted-foreground border-border hover:bg-muted/80';
            let icon = null;

            if (isMarked) {
              // Marked: Indigo + Bookmark indicator
              shapeClass = 'rounded-md ring-2 ring-[#5B4BFF]/50';
              colorClass = 'bg-[#5B4BFF]/15 text-[#5B4BFF] border-[#5B4BFF]/40 font-bold';
              icon = <Bookmark className="w-2.5 h-2.5 fill-[#5B4BFF] absolute top-1 right-1" />;
            } else if (isAnswered) {
              // Answered: Circle + Green + Check icon
              shapeClass = 'rounded-full';
              colorClass = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold';
              icon = <Check className="w-2.5 h-2.5 absolute top-1 right-1" />;
            }

            if (isCurrent) {
              colorClass += ' ring-2 ring-primary ring-offset-2 ring-offset-background';
            }

            return (
              <button
                key={q.id}
                onClick={() => goToQuestion(idx)}
                className={`relative w-11 h-11 border text-xs font-semibold flex items-center justify-center transition-all ${shapeClass} ${colorClass}`}
                title={`Question ${idx + 1}: ${
                  isMarked ? 'Marked for Review' : isAnswered ? 'Answered' : 'Not Answered'
                }`}
                aria-label={`Jump to question ${idx + 1}`}
              >
                {idx + 1}
                {icon}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend with distinct shapes & icons */}
      <div className="p-4 border-t border-border bg-muted/20 space-y-2 text-xs">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
          Legend
        </span>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-[9px] text-emerald-600 font-bold">
              ✓
            </span>
            <span>Answered ({answeredCount})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-[#5B4BFF]/20 border border-[#5B4BFF] flex items-center justify-center text-[9px] text-[#5B4BFF] font-bold">
              ★
            </span>
            <span>Marked ({markedCount})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md bg-muted border border-border" />
            <span>Unanswered ({unansweredCount})</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-md border-2 border-primary ring-1 ring-primary/40" />
            <span>Current</span>
          </div>
        </div>
      </div>
    </div>
  );
};

