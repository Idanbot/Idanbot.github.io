import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Github, Linkedin, Mail } from 'lucide-react';
import { PipelineNav } from './components/PipelineNav';
import { TerminalModal } from './components/TerminalModal';
import { DeployGame } from './components/DeployGame';
import { CommandPalette } from './components/CommandPalette';
import { GitHistory } from './components/GitHistory';
import { KonamiEasterEgg } from './components/KonamiEasterEgg';
import { HexSkillHive } from './components/HexSkillHive';
import { ParticleNetwork } from './components/ParticleNetwork';
import { ScrambleText } from './components/ScrambleText';
import { TracingBeams } from './components/TracingBeams';

function App() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const item: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 50 } },
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-cyan-500/30 overflow-x-hidden relative">
      {/* Navigation & Tools */}
      <PipelineNav />
      <TerminalModal />
      <CommandPalette />
      <KonamiEasterEgg />

      {/* Background Beams */}
      <TracingBeams />

      {/* Main Content */}
      <main className="relative z-10 w-full">
          
          {/* Hero Section (Build) */}
          <section id="hero" className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative">
            <ParticleNetwork />
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="relative z-10 text-center space-y-8 w-full max-w-4xl"
            >
              <motion.h1 variants={item} className="text-7xl md:text-9xl font-bold tracking-tighter">
                <span className="text-white block">
                   <ScrambleText text="Idan" />
                </span>
                <span className="text-gradient block mt-2">
                   <ScrambleText text="Botbol" />
                </span>
              </motion.h1>

              <motion.p variants={item} className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-light leading-relaxed">
                <span className="text-white font-medium">DevOps Engineer</span> & 
                <span className="text-white font-medium"> Backend Developer</span> crafting robust infrastructure and scalable systems.
              </motion.p>

              <motion.div variants={item} className="flex items-center justify-center gap-6 pt-8">
                <SocialLink href="https://github.com/Idanbot" icon={<Github size={24} />} label="GitHub" />
                <SocialLink href="https://www.linkedin.com/in/idanbotbol/" icon={<Linkedin size={24} />} label="LinkedIn" />
                <SocialLink href="mailto:idan@idanbot.uk" icon={<Mail size={24} />} label="Email" />
              </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 1.5, duration: 1 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <span className="text-xs text-gray-500 uppercase tracking-widest">Scroll</span>
              <motion.div 
                animate={{ y: [0, 10, 0] }} 
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="w-1 h-12 bg-gradient-to-b from-cyan-500/50 to-transparent rounded-full"
              />
            </motion.div>
          </section>

          {/* Commit History Section */}
          <section id="history" className="py-32 px-6 max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="mb-16 text-center"
            >
              <h2 className="text-4xl font-bold mb-6">Commit <span className="text-gradient">Log</span></h2>
              <p className="text-gray-400 text-lg">Changelog of my professional journey.</p>
            </motion.div>
            <GitHistory />
          </section>

          {/* Test Section (Skills Hive) */}
          <section id="skills" className="py-32 px-6 max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="mb-16 text-center"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">Technical <span className="text-gradient">Hive</span></h2>
              <p className="text-gray-400 text-lg max-w-xl mx-auto">
                Structured expertise in modern infrastructure. Hover to activate nodes.
              </p>
            </motion.div>

            <HexSkillHive />
          </section>

          {/* Deploy Section (Game) */}
          <section id="game" className="py-32 px-6 border-t border-white/5 bg-gradient-to-b from-black to-red-900/10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">Ready to <span className="text-red-500">Deploy?</span></h2>
              <p className="text-gray-400 mb-8">Warning: Production environment is unstable.</p>
              <DeployGame />
            </motion.div>
          </section>

        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 bg-black/40 backdrop-blur-md py-12 text-center">
          <p className="text-gray-500">© {new Date().getFullYear()} Idan Botbol. <span className="hidden md:inline">| Press <code className="bg-white/10 px-1 rounded">~</code> for terminal</span></p>
        </footer>
      </div>
  );
}

function SocialLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <motion.a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
      whileTap={{ scale: 0.95 }}
      className="p-4 rounded-2xl glass hover:border-cyan-500/50 transition-colors group relative"
      aria-label={label}
    >
      <div className="text-gray-400 group-hover:text-white transition-colors">
        {icon}
      </div>
    </motion.a>
  );
}

export default App;
