import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Cloud, Server, Terminal, Database, Cpu, Code2, Box, GitMerge, 
  Command, Container, Coffee, Leaf, MessageSquare, Rabbit, Lock, 
  FileCode, Layout
} from 'lucide-react';

const skills = [
  { id: 1, name: 'Kubernetes', icon: <Container size={24} />, color: '#326ce5', level: 'Expert' },
  { id: 2, name: 'AWS', icon: <Cloud size={24} />, color: '#ff9900', level: 'Expert' },
  { id: 3, name: 'Terraform', icon: <Terminal size={24} />, color: '#7b42bc', level: 'Advanced' },
  { id: 4, name: 'Docker', icon: <Box size={24} />, color: '#2496ed', level: 'Expert' },
  { id: 5, name: 'Go', icon: <Cpu size={24} />, color: '#00add8', level: 'Advanced' },
  { id: 6, name: 'React', icon: <Code2 size={24} />, color: '#61dafb', level: 'Intermediate' },
  { id: 7, name: 'Node.js', icon: <Server size={24} />, color: '#339933', level: 'Advanced' },
  { id: 8, name: 'PostgreSQL', icon: <Database size={24} />, color: '#336791', level: 'Advanced' },
  { id: 9, name: 'CI/CD', icon: <GitMerge size={24} />, color: '#2088ff', level: 'Expert' },
  { id: 10, name: 'Linux', icon: <Command size={24} />, color: '#fcc624', level: 'Expert' },
  { id: 11, name: 'Java', icon: <Coffee size={24} />, color: '#b07219', level: 'Advanced' },
  { id: 12, name: 'Spring', icon: <Leaf size={24} />, color: '#6db33f', level: 'Advanced' },
  { id: 13, name: 'Shell', icon: <Terminal size={24} />, color: '#4e4e4e', level: 'Expert' },
  { id: 14, name: 'Kafka', icon: <MessageSquare size={24} />, color: '#231f20', level: 'Advanced' },
  { id: 15, name: 'RabbitMQ', icon: <Rabbit size={24} />, color: '#ff6600', level: 'Advanced' },
  { id: 16, name: 'Vault', icon: <Lock size={24} />, color: '#ffd75e', level: 'Advanced' },
  { id: 17, name: 'Python', icon: <Layout size={24} />, color: '#3776ab', level: 'Advanced' },
  { id: 18, name: 'TS', icon: <FileCode size={24} />, color: '#3178c6', level: 'Advanced' },
];

export const HexSkillHive = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="w-full min-h-[600px] relative flex items-center justify-center bg-black/20 rounded-3xl border border-white/5 overflow-hidden py-12">
      {/* Background Grid Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent" />
      
      <div className="relative z-10 flex flex-wrap justify-center max-w-4xl gap-4 p-4">
        {skills.map((skill, i) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 15 }}
            className="relative group"
            onMouseEnter={() => setHoveredId(skill.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Hexagon Shape Wrapper */}
            <div className="w-32 h-36 relative cursor-pointer transition-transform duration-300 group-hover:-translate-y-2">
              
              {/* Glow Effect */}
              <div 
                className={`absolute inset-0 blur-xl transition-opacity duration-300 ${hoveredId === skill.id ? 'opacity-60' : 'opacity-0'}`}
                style={{ backgroundColor: skill.color }}
              />

              {/* Hexagon SVG Path */}
              <svg 
                viewBox="0 0 100 115" 
                className="w-full h-full drop-shadow-2xl"
                style={{ filter: hoveredId === skill.id ? `drop-shadow(0 0 10px ${skill.color})` : 'none' }}
              >
                <path 
                  d="M50 0 L93.3 25 V75 L50 100 L6.7 75 V25 Z" 
                  fill="#0c0c0c" 
                  stroke={hoveredId === skill.id ? skill.color : 'rgba(255,255,255,0.1)'}
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
              </svg>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                <motion.div 
                  animate={{ 
                    y: hoveredId === skill.id ? -5 : 0,
                    scale: hoveredId === skill.id ? 1.2 : 1 
                  }}
                  className="mb-2 transition-colors duration-300"
                  style={{ color: hoveredId === skill.id ? skill.color : '#6b7280' }}
                >
                  {skill.icon}
                </motion.div>
                
                <span className={`text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${hoveredId === skill.id ? 'text-white' : 'text-gray-500'}`}>
                  {skill.name}
                </span>
                
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: hoveredId === skill.id ? 1 : 0, height: hoveredId === skill.id ? 'auto' : 0 }}
                  className="overflow-hidden"
                >
                  <span className="text-[10px] text-gray-400 mt-1 block font-mono bg-black/50 px-2 py-0.5 rounded border border-white/10">
                    {skill.level}
                  </span>
                </motion.div>
              </div>

            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Decoration Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          initial={{ x: Math.random() * 1000 - 500, y: Math.random() * 1000 - 500, opacity: 0 }}
          animate={{ 
            y: [Math.random() * -100, Math.random() * 100],
            opacity: [0, 0.5, 0],
            scale: [0, 1, 0]
          }}
          transition={{ 
            duration: Math.random() * 5 + 5, 
            repeat: Infinity, 
            delay: Math.random() * 5 
          }}
          style={{ left: '50%', top: '50%' }}
        />
      ))}
    </div>
  );
};
