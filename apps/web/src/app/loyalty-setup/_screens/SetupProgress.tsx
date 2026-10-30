const STEPS = ["Profile", "Rewards", "Campaigns", "Review"] as const;

interface SetupProgressProps {
  currentStep: 1 | 2 | 3 | 4;
  className?: string;
}

export default function SetupProgress({ currentStep, className = "" }: SetupProgressProps) {
  const percent = currentStep * 25;

  return (
    <section aria-label={`Setup progress, step ${currentStep} of 4`} className={`w-full ${className}`}>
      <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 max-sm:mb-1.5 max-sm:text-[10px] sm:text-[13px]">
        <span>Step {currentStep} of 4 · {STEPS[currentStep - 1]}</span>
        <span className="text-orange-600">{percent}%</span>
      </div>
      <div className="relative grid grid-cols-4">
        <div aria-hidden="true" className="absolute left-[10%] right-[10%] top-[14px] h-0.5 bg-slate-200 max-sm:top-[10px]">
          <div className="h-full bg-orange-500" style={{ width: `${((currentStep - 1) / 3) * 100}%` }} />
        </div>
        {STEPS.map((label, index) => {
          const stepNumber = index + 1;
          const isComplete = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={label}
              aria-current={isCurrent ? "step" : undefined}
              className={`relative z-10 flex min-w-0 flex-col items-center gap-2 max-sm:gap-1.5 ${isCurrent ? "text-orange-700" : isComplete ? "text-slate-700" : "text-slate-400"}`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-full border text-[14px] font-bold max-sm:h-6 max-sm:w-6 max-sm:text-[10px] ${isComplete ? "border-orange-500 bg-orange-500 text-white" : isCurrent ? "border-orange-500 bg-orange-50 text-orange-700 ring-4 ring-orange-100 max-sm:ring-2" : "border-slate-300 bg-white text-slate-500"}`}>
                {isComplete ? <span aria-hidden="true">✓</span> : stepNumber}
              </span>
              <span className="max-w-full truncate text-[9px] font-semibold sm:text-[11px]">{label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
