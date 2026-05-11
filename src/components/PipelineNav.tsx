import { m } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const sections = [
  { id: 'hero', label: 'Init' },
  { id: 'skills', label: 'Stack' },
  { id: 'history', label: 'Source' },
  { id: 'monitor', label: 'Monitor' },
];

export const PipelineNav = ({ activeSection }: { activeSection: string }) => {
  return (
    <div className="fixed right-4 xl:right-6 top-1/2 z-50 hidden -translate-y-1/2 flex-col gap-5 rounded-2xl bg-black/25 p-4 shadow-2xl backdrop-blur-md lg:flex xl:gap-6 xl:p-6 items-end">
      <div className="absolute right-[31px] top-8 bottom-8 w-0.5 bg-white/10 xl:right-[35px] xl:top-10 xl:bottom-10" />
      {sections.map(({ id, label }, index) => {
        const isActive = activeSection === id;
        const activeIdx = sections.findIndex((s) => s.id === activeSection);
        const isPast = activeIdx > index;

        return (
          <m.a
            key={id}
            href={`#${id}`}
            className="group relative flex min-h-11 min-w-0 items-center gap-3 rounded-lg py-2 pl-2 pr-2 outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background xl:gap-4 xl:pr-3"
            initial={false}
            animate={{ opacity: isActive || isPast ? 1 : 0.45 }}
          >
            <span
              className={`
              text-xs xl:text-sm font-mono tracking-wider transition-colors duration-300
              ${
                isActive && id !== 'monitor'
                  ? 'text-primary'
                  : isPast || (isActive && id === 'monitor')
                    ? 'text-emerald-400'
                    : 'text-foreground/90'
              }
            `}
            >
              {label}
            </span>
            <div
              className={`
              relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full
              border-2 bg-background transition-colors duration-300
              ${
                isActive && id !== 'monitor'
                  ? 'border-primary text-primary'
                  : isPast || (isActive && id === 'monitor')
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-white/20 text-white/20'
              }
            `}
            >
              {isPast || (id === 'monitor' && isActive) ? (
                <CheckCircle2 size={14} />
              ) : isActive ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Circle size={14} />
              )}
            </div>
          </m.a>
        );
      })}
    </div>
  );
};
