import React from 'react';
import { useTestStore } from '@/stores/testStore';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { CheckCircle2, AlertTriangle, Bookmark, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const SubmitModal: React.FC<Props> = ({ isOpen, onClose, onConfirm }) => {
  const { questions, answers, isSubmitting } = useTestStore();

  const answeredCount = Object.values(answers).filter((a) => a.selectedOption !== null).length;
  const markedCount = Object.values(answers).filter((a) => a.isMarkedForReview).length;
  const unansweredCount = questions.length - answeredCount;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Assessment"
      description="Review your question completion status before final submission."
      footer={
        <div className="flex items-center gap-3 w-full justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Return to Questions
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isSubmitting}
            className="gap-2 bg-gradient-trinetra text-white border-0"
          >
            Confirm & Finalize
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-foreground font-heading">{answeredCount}</div>
            <div className="text-[11px] text-muted-foreground">Answered</div>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-500 mx-auto mb-1" />
            <div className="text-xl font-bold text-foreground font-heading">{unansweredCount}</div>
            <div className="text-[11px] text-muted-foreground">Unanswered</div>
          </div>

          <div className="p-3 rounded-xl bg-[#5B4BFF]/10 border border-[#5B4BFF]/20">
            <Bookmark className="w-5 h-5 text-[#5B4BFF] mx-auto mb-1" />
            <div className="text-xl font-bold text-foreground font-heading">{markedCount}</div>
            <div className="text-[11px] text-muted-foreground">Marked</div>
          </div>
        </div>

        {unansweredCount > 0 && (
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-700 dark:text-amber-400">
            Notice: You still have <strong>{unansweredCount}</strong> unanswered questions. Unanswered questions will receive 0 marks.
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">
          Once submitted, your responses and proctoring telemetry will be committed securely. You cannot re-enter this examination session.
        </p>
      </div>
    </Modal>
  );
};

