import { useState } from 'react';
import { motion } from 'framer-motion';
import { Box, Download, CheckCircle, Server, Database, Globe } from 'lucide-react';
import { ScrambleText } from './ScrambleText';

interface Project {
  id: string;
  name: string;
  tag: string;
  description: string;
  icon: any;
  tech: string[];
}

const projects: Project[] = [
  {
    id: 'img-react',
    name: 'weather-frontend',
    tag: 'v1.2.0',
    description: 'Responsive dashboard visualizing real-time climate data. Built with React, Vite, and TailwindCSS.',
    icon: Globe,
    tech: ['React', 'TypeScript', 'Vite', 'Shadcn UI']
  },
  {
    id: 'img-py',
    name: 'weather-backend',
    tag: 'v2.0.1',
    description: 'Scalable REST API for weather data aggregation.',
    icon: Database,
    tech: ['Python', 'Flask', 'Gunicorn']
  },
  {
    id: 'img-nginx',
    name: 'reverse-proxy',
    tag: 'stable',
    description: 'High-performance edge router serving the frontend and proxying API requests.',
    icon: Server,
    tech: ['Nginx', 'Docker', 'SSL']
  }
];

export const BuildSection = ({ className }: { className?: string }) => {
  return (
    <section id="build" className={`py-32 px-6 max-w-7xl mx-auto relative z-40 ${className}`}>
      <div className="mb-16 text-center">
        <h2 className="text-4xl font-bold mb-6 flex items-center justify-center gap-3">
          <Box className="text-cyan-500" size={40} />
          <span>Artifact <span className="text-gradient">Registry</span></span>
        </h2>
        <p className="text-gray-400 text-lg">Container images and Helm charts for the Weather Platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </section>
  );
};

const ProjectCard = ({ project }: { project: Project }) => {
  const [status, setStatus] = useState<'idle' | 'pulling' | 'pulled'>('idle');
  const [progress, setProgress] = useState(0);

  const handlePull = () => {
    setStatus('pulling');
    const duration = 250 + Math.random() * 1000;
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min((currentStep / steps) * 100, 100);
      setProgress(newProgress);

      if (currentStep >= steps) {
        clearInterval(timer);
        setStatus('pulled');
      }
    }, interval);
  };

  return (
    <div className="bg-[#16161e]/80 border border-white/10 rounded-lg overflow-hidden hover:border-cyan-500/30 transition-all group relative">
      {/* Header (Always visible) */}
      <div className="p-4 border-b border-white/5 bg-[#1a1b26] flex justify-between items-center">
        <div className="flex items-center gap-2 font-mono text-sm">
          <project.icon size={16} className="text-cyan-400" />
          <span className="text-gray-300">{project.name}:{project.tag}</span>
        </div>
        <div className="text-xs text-gray-500 font-mono">{project.id}</div>
      </div>

      {/* Content Body */}
      <div className="p-6 min-h-[200px] flex flex-col justify-center items-center relative">

        {status === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <Box size={48} className="mx-auto text-gray-600 group-hover:text-cyan-500/50 transition-colors" />
            <button
              onClick={handlePull}
              aria-label={`Pull ${project.name} image`}
              className="group/btn relative flex items-center gap-2 px-6 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded border border-cyan-500/50 font-mono text-sm transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <Download size={18} />
              docker pull {project.name}:{project.tag}
            </button>
          </motion.div>
        )}

        {status === 'pulling' && (
          <div className="w-full max-w-[80%] space-y-2 font-mono text-xs">
            <div className="flex justify-between text-cyan-400">
              <span>Pulling layer {project.id.substring(4)}...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded overflow-hidden">
              <motion.div
                className="h-full bg-cyan-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="space-y-1 text-gray-500">
              <p>Verifying checksum...</p>
              <p>Extracting layers...</p>
            </div>
          </div>
        )}

        {status === 'pulled' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full text-left space-y-4"
          >
            <div className="font-mono text-sm text-green-400 flex items-center gap-2">
              <CheckCircle size={14} />
              Image successfully pulled
            </div>
            <h3 className="text-xl font-bold text-white">
              <ScrambleText text={project.name} interval={30} />
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              <ScrambleText text={project.description} interval={30} />
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {project.tech.map(t => (
                <span key={t} className="px-2 py-1 text-[10px] bg-white/5 border border-white/10 rounded text-gray-300 font-mono">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};