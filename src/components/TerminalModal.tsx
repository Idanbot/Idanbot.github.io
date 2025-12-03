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

  const domainIpMap = useRef<Record<string, string>>({});

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
    if (!trimmedInput) return;

    const parts = trimmedInput.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    const argsString = args.join(' ');

    setHistory(prev => [...prev, `> ${input}`]);

    let response = '';

    switch (cmd) {
      case 'help':
        response = 'Available commands: help, about, skills, clear, exit, date, pwd, ls, echo, repo, whoami, sudo, uptime, ping, weather, tmux, nvim, vim, vi, htop, btop, uname, neofetch, curl, rev, joke, mkdir, touch, rm, cat';
        break;
      case 'echo':
        response = argsString;
        break;
      case 'tmux':
      case 'nvim':
      case 'vim':
      case 'vi':
      case 'htop':
      case 'btop':
        setShowMonitor(true);
        response = 'Starting session...';
        break;
      case 'about':
        response = 'Idan Botbol: DevOps Engineer & Backend Developer specializing in robust infrastructure.';
        break;
      case 'skills':
        response = 'STACK: Kubernetes, AWS, Terraform, Docker, Linux, Java, Spring Boot, Go, Node.js, React, PostgreSQL';
        break;
      case 'cat':
        if (args[0] === 'contact.md') {
          response = 'Email: idan@idanbot.uk | GitHub: @Idanbot';
        } else if (args[0] === 'secret_key.pem') {
          response = '-----BEGIN PRIVATE KEY-----\ncoWJSD5bkVuL0MlPb8Bz/d8Drl7wgLIh3BsWWw94J0KFcGHKPkR+zJoAi1962rlX\nAOh2w1tglkW9qK3CnujJTS/B/sTRojqD6mzJSPPUB0ER/L8H/OByCVZW8Ufbhyl7\nptEmxrEDq7HyhoRCsKMCGfpDF2Xjw3fwcIYrZ3nnIvfsLB1jclXEr9PwfuDFzIQz\nrm4QsnOS+qBQWOh0Zx8i7awsD0XVrPWbLmsmOhml9DaDbh1lF6D1wB+KmFDyb0ym\nutTTpPTKFrg+Zd8jlx241L79JV2eldz9Rh0JpxwTLX1jpf89N1b93AGAGThXMR0X\n-----END PRIVATE KEY-----';
        } else if (args[0] === 'secret_key.info') {
          response = 'Don\'t tell anyone but secret_key.pem opens no doors...';
        } else {
          response = `cat: ${args[0] || ''}: No such file or directory`;
        }
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
      case 'ping':
        if (!args[0]) {
          response = 'ping: usage error: Destination address required';
          break;
        }
        const target = args[0];
        const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(target);
        const isDomain = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(target);

        if (!isIP && !isDomain && target !== 'localhost' && target !== '127.0.0.1' && target !== '0.0.0.0' && target !== '255.255.255.255') {
          response = `ping: ${target}: Name or service not known`;
          break;
        }

        let ip = target;
        if (!isIP) {
          if (domainIpMap.current[target]) {
            ip = domainIpMap.current[target];
          } else {
            ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
            domainIpMap.current[target] = ip;
          }
        }

        const seqs = [1, 2, 3, 4];
        const pings = seqs.map(seq => {
          const time = (Math.random() * 40 + 10).toFixed(1);
          return `64 bytes from ${ip}: icmp_seq=${seq} ttl=114 time=${time} ms`;
        }).join('\n');
        const stats = `\n--- ${target} ping statistics ---\n4 packets transmitted, 4 received, 0% packet loss, time 3004ms\nrtt min/avg/max/mdev = 10.2/25.4/48.1/12.3 ms`;
        response = `PING ${target} (${ip}): 56 data bytes\n${pings}${stats}`;
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
        if (args.includes('-a')) {
          response = '.  ..  .config  contact.md  secret_key.pem  secret_key.info';
        } else {
          response = 'contact.md  secret_key.pem  secret_key.info';
        }
        break;
      case 'repo':
        response = 'Opening GitHub repository...';
        window.open('https://github.com/Idanbot/Idanbot.github.io', '_blank');
        break;
      case 'man':
        response = 'What manual? You are the manual.';
        break;
      case 'uname':
        if (args.includes('-a')) {
          response = 'Linux idan-portfolio 5.15.0-100-generic #1 SMP Mon Oct 25 10:00:00 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux';
        } else {
          response = 'Linux';
        }
        break;
      case 'neofetch':
        response = `
       .---.
      /     \\      OS: IdanOS Linux x86_64
      |  O  |      Host: Portfolio v2.0
      \\  _  /      Kernel: 5.15.0-custom
       '.___.'     Uptime: ${Math.floor(performance.now() / 60000)} mins
                   Packages: 1337 (dpkg)
                   Shell: zsh 5.8
                   Theme: Neo-Cyber [GTK3]
                   Icons: Papirus [GTK3]
                   Terminal: IdanTerm
                   CPU: Neural Engine v9
                   Memory: 64GB / 128GB
        `;
        break;
      case 'curl':
        if (!args[0]) {
          response = 'curl: try \'curl --help\' or \'curl --manual\' for more information';
        } else {
          response = `curl: (6) Could not resolve host: ${args[0]}`;
        }
        break;
      case 'rev':
        response = argsString.split('').reverse().join('');
        break;
      case 'joke':
        const jokes = [
          "Why do programmers prefer dark mode? Because light attracts bugs.",
          "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
          "I would tell you a UDP joke, but you might not get it.",
          "There are 10 types of people in the world: those who understand binary, and those who don't.",
          "A SQL query walks into a bar, walks up to two tables and asks, 'Can I join you?'",
          "Why was the JavaScript developer sad? Because he didn't know how to 'null' his feelings.",
          "Why do Java developers wear glasses? Because they don't C#.",
          "What is a DevOps engineer's favorite hangout place? The cloud.",
          "Why did the developer go broke? Because he used up all his cache.",
          "How do you comfort a JavaScript bug? You console it.",
          "Why did the functional programmer get thrown out of school? Because he refused to take classes.",
          "What did the router say to the doctor? 'It hurts when IP.'",
          "Why don't programmers like nature? It has too many bugs.",
          "What's a Linux user's favorite game? sudo ku.",
          "Why did the database administrator leave his wife? She had one-to-many relationships.",
          "How do you explain the movie Inception to a programmer? It's basically a recursive function.",
          "Why was the computer cold? It left its Windows open.",
          "What do you call a programmer from Finland? Nerdic.",
          "Why did the web developer walk out of the restaurant? The table layout was broken.",
          "What is a programmer's favorite snack? Microchips.",
          "Why do Python programmers have low self-esteem? Because they're constantly comparing their self to others.",
          "What did the server say to the client? '200 OK.'",
          "Why did the edge server go bankrupt? because it lost its content.",
          "Why was the math book sad? Because it had too many problems.",
          "Parallel lines have so much in common. It’s a shame they’ll never meet."
        ];
        response = jokes[Math.floor(Math.random() * jokes.length)];
        break;
      case 'mkdir':
        response = `mkdir: cannot create directory '${args[0] || ''}': Permission denied`;
        break;
      case 'touch':
        response = `touch: cannot touch '${args[0] || ''}': Permission denied`;
        break;
      case 'rm':
        if (args.includes('-rf') && (args.includes('/') || args.includes('*'))) {
          response = 'Nice try, but I cannot let you do that, Dave.';
        } else {
          response = `rm: cannot remove '${args[0] || ''}': Permission denied`;
        }
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
