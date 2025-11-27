import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal as TerminalIcon } from 'lucide-react';
import { SystemMonitor } from './SystemMonitor';

export const TerminalModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>(['Welcome to IdanBot Term v1.0.0', 'Type "help" for available commands.']);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showMonitor) {
        setShowMonitor(false);
        e.preventDefault(); // Prevent other actions when closing monitor
        return;
      }
      
      if (e.key === '`' || e.key === '~') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMonitor]);

  useEffect(() => {
    if (isOpen && inputRef.current && !showMonitor) {
      inputRef.current.focus();
    }
  }, [isOpen, showMonitor]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    const cmd = trimmedInput.toLowerCase();
    setHistory(prev => [...prev, `> ${input}`]);
    
    let response = '';

    if (cmd.startsWith('echo ')) {
        response = trimmedInput.substring(5);
    } else {
        switch (cmd) {
        case 'help':
            response = 'Available commands: help, about, skills, contact, clear, exit, date, pwd, ls, echo, repo, whoami, sudo, uptime, ping, weather, tmux, nvim';
            break;
        case 'tmux':
        case 'nvim':
        case 'vim':
            setShowMonitor(true);
            response = 'Starting session...';
            break;
        case 'about':
            response = 'Idan Botbol: DevOps Engineer & Backend Developer specializing in robust infrastructure.';
            break;
        case 'skills':
            response = 'STACK: Kubernetes, AWS, Terraform, Docker, Linux, Java, Spring Boot, Go, Node.js, React, PostgreSQL';
            break;
        case 'contact':
            response = 'Email: idan@idanbot.uk | GitHub: @Idanbot';
            break;
        case 'cat contact.md':
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
        case 'cat secret_key.pem':
            response = '-----BEGIN PRIVATE KEY-----\ncoWJSD5bkVuL0MlPb8Bz/d8Drl7wgLIh3BsWWw94J0KFcGHKPkR+zJoAi1962rlX\nAOh2w1tglkW9qK3CnujJTS/B/sTRojqD6mzJSPPUB0ER/L8H/OByCVZW8Ufbhyl7\nptEmxrEDq7HyhoRCsKMCGfpDF2Xjw3fwcIYrZ3nnIvfsLB1jclXEr9PwfuDFzIQz\nrm4QsnOS+qBQWOh0Zx8i7awsD0XVrPWbLmsmOhml9DaDbh1lF6D1wB+KmFDyb0ym\nutTTpPTKFrg+Zd8jlx241L79JV2eldz9Rh0JpxwTLX1jpf89N1b93AGAGThXMR0X\n-----END PRIVATE KEY-----';
            break;
        case 'cat secret_key.info':
            response = 'Don\'t tell anyone but secret_key.pem opens no doors...';
            break;
        case 'ping google.com':
            response = 'PING google.com (142.250.185.78): 56 data bytes\n64 bytes from 142.250.185.78: icmp_seq=1 ttl=114 time=14.2 ms\n64 bytes from 142.250.185.78: icmp_seq=2 ttl=114 time=21.1 ms\n64 bytes from 142.250.185.78: icmp_seq=3 ttl=114 time=11.7 ms\n^C';
            break;
        case 'weather':
            response = 'Cloudy with a chance of serverless functions.';
            break;
        case 'date':
            response = new Date().toString();
            break;
        case 'pwd':
            response = '/home/idan/portfolio';
            break;
        case 'ls':
            response = 'contact.md  secret_key.pem  secret_key.info';
            break;
        case 'repo':
            response = 'Opening GitHub repository...';
            window.open('https://github.com/Idanbot/Idanbot.github.io', '_blank');
            break;
        case 'man':
            response = 'What manual? You are the manual.';
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
    }
    
    setHistory(prev => [...prev, response]);
    setInput('');
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        aria-label="Open terminal"
        className="fixed bottom-6 left-6 z-50 p-3 rounded-full bg-black/80 border border-white/20 text-green-400 hover:bg-green-400/20 transition-all"
      >
        <TerminalIcon size={20} />
      </button>

      <AnimatePresence>
        {showMonitor && (
           <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             exit={{ opacity: 0, scale: 0.95 }}
             className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-10 cursor-pointer"
             onClick={() => setShowMonitor(false)}
           >
             <div className="w-full max-w-7xl" onClick={(e) => e.stopPropagation()}>
                <SystemMonitor />
                <p className="text-center text-gray-500 mt-4 animate-pulse">Press any key or click anywhere to close session</p>
             </div>
           </motion.div>
        )}

        {isOpen && !showMonitor && (
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
