import { CheckCircle, Circle, Clock } from 'lucide-react';

/**
 * ApprovalStepper
 * Renders the 5-step maintenance workflow visually.
 * Props: steps [{ label, completed, date }]
 */
export default function ApprovalStepper({ steps = [] }) {
  const currentStep = steps.findLastIndex?.((s) => s.completed) ?? steps.reduce((acc, s, i) => s.completed ? i : acc, -1);

  return (
    <div className="flex items-start gap-0 w-full overflow-x-auto pb-2">
      {steps.map((step, i) => {
        const isDone = step.completed;
        const isCurrent = i === currentStep + 1;
        const isLast = i === steps.length - 1;

        return (
          <div key={step.label} className="flex items-center flex-1 min-w-0">
            {/* Step node */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                isDone ? 'bg-status-available border-status-available' :
                isCurrent ? 'bg-primary border-primary' :
                'bg-surface border-border-divider'
              }`}>
                {isDone ? (
                  <CheckCircle size={16} className="text-white" />
                ) : isCurrent ? (
                  <Clock size={14} className="text-white" />
                ) : (
                  <Circle size={14} className="text-text-muted" />
                )}
              </div>
              <div className="mt-2 text-center w-16">
                <p className={`text-[11px] font-semibold leading-snug ${isDone ? 'text-status-available' : isCurrent ? 'text-primary' : 'text-text-muted'}`}>
                  {step.label}
                </p>
                {step.date && (
                  <p className="text-[10px] text-text-muted mt-0.5">{step.date}</p>
                )}
              </div>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-1 mt-[-20px] ${isDone ? 'bg-status-available' : 'bg-border-divider'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
