import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal as TerminalIcon } from 'lucide-react';

export const TerminalModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>(['Welcome to IdanBot Term v1.0.0', 'Type "help" for available commands.']);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    setHistory(prev => [...prev, `> ${input}`]);
    
    let response = '';
    switch (cmd) {
      case 'help':
        response = 'Available commands: help, about, skills, contact, clear, exit';
        break;
      case 'about':
        response = 'Idan Botbol: DevOps Engineer & Backend Developer specializing in robust infrastructure.';
        break;
      case 'skills':
        response = 'STACK: Kubernetes, AWS, Terraform, Go, Node.js, React, PostgreSQL';
        break;
      case 'contact':
        response = 'Email: idan@idanbot.uk | GitHub: @Idanbot';
        break;
      case 'whoami':
        response = 'root';
        break;
      case 'sudo':
        response = 'user is not in the sudoers file. This incident will be reported.';
        break;
      case 'uptime':
        response = `up ${Math.floor(performance.now() / 1000)} seconds, 1 user, load average: 0.00, 0.01, 0.05`;
        break;
      case 'cat resume.txt':
        response = 'Error: Permission denied (public version available at /history)';
        break;
      case 'ping google.com':
        response = 'PING google.com (142.250.185.78): 56 data bytes\n64 bytes from 142.250.185.78: icmp_seq=0 ttl=114 time=14.2 ms\n... (Ctrl+C to stop)';
        break;
      case 'weather':
        response = 'Cloudy with a chance of serverless functions.';
        break;
      case 'clear':
        setHistory([]);
        setInput('');
        return;
      case 'exit':
        setIsOpen(false);
        setInput('');
        return;
      default:
        response = `Command not found: ${cmd}`;
    }
    
    setHistory(prev => [...prev, response]);
    setInput('');
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-black/80 border border-white/20 text-green-400 hover:bg-green-400/20 transition-all"
      >
        <TerminalIcon size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 right-0 h-[50vh] bg-[#0c0c0c]/95 backdrop-blur-md border-b border-green-500/30 z-[100] shadow-2xl font-mono text-sm md:text-base overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/5">
              <span className="text-green-400 flex items-center gap-2">
                <TerminalIcon size={14} /> idan@portfolio:~
              </span>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-2 text-gray-300" onClick={() => inputRef.current?.focus()}>
              {history.map((line, i) => (
                <div key={i} className="whitespace-pre-wrap break-words">{line}</div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleCommand} className="p-4 border-t border-white/10 bg-black/20 flex items-center gap-2">
              <span className="text-green-400">❯</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-600"
                placeholder="Type 'help'..."
                autoFocus
              />
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
