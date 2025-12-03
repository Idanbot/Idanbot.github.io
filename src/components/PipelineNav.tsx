import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const sections = [
  { id: 'hero', label: 'Init' },
  { id: 'history', label: 'Source' },
  { id: 'build', label: 'Build' },
  { id: 'test', label: 'Test' },
  { id: 'game', label: 'Deploy' },
  { id: 'monitor', label: 'Monitor' },
];

export const PipelineNav = ({ activeSection }: { activeSection: string }) => {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-8 p-6 rounded-2xl bg-black/20 shadow-2xl items-end">
      <div className="absolute right-[35px] top-10 bottom-10 w-0.5 bg-white/10" />
      {sections.map(({ id, label }, index) => {
        const isActive = activeSection === id;
        const isPast = sections.findIndex(s => s.id === activeSection) > index;

        return (
          <motion.a
            key={id}
            href={`#${id}`}
            className="relative flex items-center gap-4 group"
            initial={false}
            animate={{ opacity: isActive || isPast ? 1 : 0.5 }}
          >
            <span className={`
              text-sm font-mono tracking-wider transition-colors duration-300
              ${isActive && id !== 'monitor' ? 'text-cyan-300' :
                isPast || (isActive && id === 'monitor') ? 'text-green-300' :
                  'text-gray-100'}
            `}>
              {label}
            </span>
            <div className={`
              relative z-10 w-6 h-6 rounded-full flex items-center justify-center
              bg-[#050505] border-2 transition-colors duration-300
              ${isActive && id !== 'monitor' ? 'border-cyan-400 text-cyan-400' :
                isPast || (isActive && id === 'monitor') ? 'border-green-400 text-green-400' :
                  'border-white/20 text-white/20'}
            `}>
              {isPast || (id === 'monitor' && isActive) ? <CheckCircle2 size={14} /> :
                isActive ? <Loader2 size={14} className="animate-spin" /> :
                  <Circle size={14} />}
            </div>
          </motion.a>
        );
      })}
    </div>
  );
};
