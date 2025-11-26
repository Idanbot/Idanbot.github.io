import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const sections = [
  { id: 'hero', label: 'Source' },
  { id: 'stats', label: 'Build' },
  { id: 'skills', label: 'Test' },
  { id: 'game', label: 'Deploy' },
];

export const PipelineNav = () => {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    sections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-8">
      <div className="absolute left-[11px] top-4 bottom-4 w-0.5 bg-white/10" />
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
            <div className={`
              relative z-10 w-6 h-6 rounded-full flex items-center justify-center
              bg-[#050505] border-2 transition-colors duration-300
              ${isActive ? 'border-cyan-400 text-cyan-400' : 
                isPast ? 'border-green-400 text-green-400' : 
                'border-white/20 text-white/20'}
            `}>
              {isPast ? <CheckCircle2 size={14} /> : 
               isActive ? <Loader2 size={14} className="animate-spin" /> : 
               <Circle size={14} />}
            </div>
            <span className={`
              text-sm font-mono tracking-wider transition-colors duration-300
              ${isActive ? 'text-cyan-400' : 
                isPast ? 'text-green-400' : 
                'text-gray-500'}
            `}>
              {label}
            </span>
          </motion.a>
        );
      })}
    </div>
  );
};
