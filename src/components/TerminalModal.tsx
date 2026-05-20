import React, { useState, useEffect, useRef } from 'react';
import { m, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Terminal as TerminalIcon } from 'lucide-react';

interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    jsHeapLimit: number;
    totalJSHeapSize: number;
  };
}
import { SystemMonitor } from './SystemMonitor';
import { OPEN_TERMINAL_EVENT } from '@/lib/site-events';

const TERMINAL_COMMANDS = [
  'about',
  'btop',
  'cat',
  'clear',
  'curl',
  'date',
  'echo',
  'exit',
  'help',
  'htop',
  'joke',
  'ls',
  'man',
  'mkdir',
  'neofetch',
  'nvim',
  'ping',
  'pwd',
  'repo',
  'rev',
  'rm',
  'skills',
  'sudo',
  'tmux',
  'touch',
  'uname',
  'uptime',
  'vi',
  'vim',
  'weather',
  'whoami',
].sort((a, b) => a.localeCompare(b));

const VIRTUAL_FILES = ['contact.md', 'roadmap.txt'].sort((a, b) => a.localeCompare(b));

function longestCommonPrefix(strs: string[]): string {
  if (strs.length === 0) return '';
  const s0 = strs[0];
  for (let i = 0; i < s0.length; i++) {
    const c = s0[i];
    for (let j = 1; j < strs.length; j++) {
      if (i >= strs[j].length || strs[j][i] !== c) return s0.slice(0, i);
    }
  }
  return s0;
}

export const TerminalModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMonitor, setShowMonitor] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    'Welcome to IdanBot Term v1.0.0',
    'Type "help" for available commands. Press Tab to complete commands or cat(1) filenames.',
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const reduceMotionFm = useReducedMotion();

  const domainIpMap = useRef<Record<string, string>>({});
  /** Consecutive Tab presses for cycling when the line is already at the longest common prefix. */
  const tabCycleRef = useRef(0);

  useEffect(() => {
    const openFromChrome = () => setIsOpen(true);
    window.addEventListener(OPEN_TERMINAL_EVENT, openFromChrome);
    return () => window.removeEventListener(OPEN_TERMINAL_EVENT, openFromChrome);
  }, []);

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

  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      if (inputRef.current && !showMonitor) {
        inputRef.current.focus();
      }
    } else {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }
  }, [isOpen, showMonitor]);

  useEffect(() => {
    if (!isOpen || showMonitor) return;

    const handleFocusTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (!modalRef.current) return;

      const focusableEls = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select'
      );
      if (focusableEls.length === 0) return;

      const firstEl = focusableEls[0];
      const lastEl = focusableEls[focusableEls.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          lastEl.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastEl) {
          firstEl.focus();
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleFocusTrap);
    return () => window.removeEventListener('keydown', handleFocusTrap);
  }, [isOpen, showMonitor]);

  useEffect(() => {
    const smooth =
      typeof window !== 'undefined' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
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
        response = `Available commands: ${TERMINAL_COMMANDS.join(', ')}\nTip: press Tab to complete commands and \`cat\` filenames.`;
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
        response =
          'STACK: Kubernetes, Helm, AWS, GCP, Terraform, Docker, Nginx, Argo CD, Linux, Bash, Spring Boot, Go, Python, Java, Node.js, React, TypeScript, PostgreSQL, Redis, Cassandra, RabbitMQ, Kafka, Prometheus, Grafana, Elasticsearch, Datadog';
        break;
      case 'cat':
        if (args[0] === 'contact.md') {
          response = 'Email: idan@idanbot.uk | GitHub: @Idanbot';
        } else if (args[0] === 'roadmap.txt') {
          response =
            'GCP Professional Cloud Architect (PCA) — see Stack section + Credly badge link for verification.';
        } else {
          const name = args[0] || '(missing path)';
          response = `cat: ${name}: No such file or directory\nHint: try \`cat contact.md\` or \`cat roadmap.txt\`.`;
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
      case 'ping': {
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
      }
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
          response = '.  ..  .config  contact.md  roadmap.txt';
        } else {
          response = 'contact.md  roadmap.txt';
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
      case 'neofetch': {
        let clientOS = 'Linux x86_64';
        let clientShell = 'zsh 5.8';
        if (typeof window !== 'undefined') {
          const ua = window.navigator.userAgent;
          if (ua.includes('Macintosh')) {
            clientOS = 'macOS (Darwin)';
            clientShell = 'zsh (iterm)';
          } else if (ua.includes('Windows')) {
            clientOS = 'Windows (WSL)';
            clientShell = 'powershell';
          } else if (ua.includes('Android')) {
            clientOS = 'Android (Linux)';
            clientShell = 'sh (termux)';
          } else if (ua.includes('iPhone') || ua.includes('iPad')) {
            clientOS = 'iOS (Darwin)';
            clientShell = 'bash';
          }
        }
        const cores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 4) : 4;
        let memStr = '512MB / 4096MB (JS Heap)';
        const memory = typeof window !== 'undefined' ? (window.performance as PerformanceWithMemory).memory : undefined;
        if (memory) {
          memStr = `${Math.round(memory.usedJSHeapSize / (1024 * 1024))}MB / ${Math.round(memory.jsHeapLimit / (1024 * 1024))}MB (JS Heap)`;
        }

        response = `
       .---.
      /     \\      OS: ${clientOS}
      |  O  |      Host: Browser Session
      \\  _  /      Kernel: 5.15.0-browser
       '.___.'     Uptime: ${Math.floor(performance.now() / 60000)} mins
                   Packages: 42 (npm-deps)
                   Shell: ${clientShell}
                   Theme: Cyber-Tokyo [GTK3]
                   Icons: Tokyo-Night [GTK3]
                   Terminal: IdanTerm
                   CPU: ${cores}x Logical Cores
                   Memory: ${memStr}
        `;
        break;
      }
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
      case 'joke': {
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
      }
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
        response = `Command not found: ${cmd}. Type \`help\` to see what this shell understands, or try \`skills\` / \`about\`.`;
    }

    setHistory(prev => [...prev, response]);
    setInput('');
  };

  const applyTabCompletion = () => {
    const line = input;
    const catFile = line.match(/^(\s*cat\s+)(\S*)$/i);
    if (catFile) {
      const prefix = catFile[1];
      const partial = catFile[2];
      const partialLower = partial.toLowerCase();
      const matches = VIRTUAL_FILES.filter((f) => f.toLowerCase().startsWith(partialLower));
      if (matches.length === 0) {
        tabCycleRef.current = 0;
        return;
      }
      if (matches.length === 1) {
        setInput(`${prefix}${matches[0]}`);
        tabCycleRef.current = 0;
        return;
      }
      const lcp = longestCommonPrefix(matches);
      if (lcp.length > partial.length) {
        setInput(`${prefix}${lcp}`);
        tabCycleRef.current = 0;
        return;
      }
      const idx = tabCycleRef.current % matches.length;
      setInput(`${prefix}${matches[idx]}`);
      tabCycleRef.current = idx + 1;
      return;
    }

    const cmdOnly = line.match(/^(\s*)(\S*)$/);
    if (!cmdOnly) {
      tabCycleRef.current = 0;
      return;
    }
    const indent = cmdOnly[1];
    const token = cmdOnly[2];
    const tokenLower = token.toLowerCase();
    const matches = TERMINAL_COMMANDS.filter((c) => c.startsWith(tokenLower));
    if (matches.length === 0) {
      tabCycleRef.current = 0;
      return;
    }
    if (matches.length === 1) {
      setInput(`${indent}${matches[0]} `);
      tabCycleRef.current = 0;
      return;
    }
    const lcp = longestCommonPrefix(matches);
    if (lcp.length > token.length) {
      setInput(`${indent}${lcp}`);
      tabCycleRef.current = 0;
      return;
    }
    const idx = tabCycleRef.current % matches.length;
    setInput(`${indent}${matches[idx]} `);
    tabCycleRef.current = idx + 1;
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Tab') {
      tabCycleRef.current = 0;
      return;
    }
    e.preventDefault();
    if (!isOpen || showMonitor) return;
    applyTabCompletion();
  };

  return (
    <>
      <AnimatePresence>
        {showMonitor && (
          <m.div
            initial={reduceMotionFm ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={reduceMotionFm ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            transition={reduceMotionFm ? { duration: 0.12 } : undefined}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 md:p-10 cursor-pointer"
            onClick={() => setShowMonitor(false)}
          >
            <div className="w-full max-w-7xl" onClick={(e) => e.stopPropagation()}>
              <SystemMonitor />
              <p className="text-center text-gray-500 mt-4 animate-pulse">Press any key or click anywhere to close session</p>
            </div>
          </m.div>
        )}

        {isOpen && !showMonitor && (
          <m.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Terminal"
            initial={reduceMotionFm ? { y: 0, opacity: 1 } : { y: '-100%' }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduceMotionFm ? { opacity: 0 } : { y: '-100%' }}
            transition={
              reduceMotionFm
                ? { duration: 0.12 }
                : { type: 'spring', damping: 25, stiffness: 200 }
            }
            className="fixed left-0 right-0 top-0 z-[100] flex h-[50vh] flex-col overflow-hidden border-b border-primary/35 bg-card/95 font-mono text-sm shadow-2xl backdrop-blur-md md:text-base"
          >
            <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-2">
              <span className="flex items-center gap-2 text-primary">
                <TerminalIcon size={14} aria-hidden /> idan@portfolio:~
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close terminal"
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/75 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
              >
                <X size={18} aria-hidden />
              </button>
            </div>

            <div
              className="flex-1 space-y-2 overflow-y-auto p-4 text-gray-300"
              onClick={() => inputRef.current?.focus()}
              aria-live="polite"
              aria-relevant="additions"
            >
              {history.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Screen cleared. Type <kbd className="rounded border border-white/15 bg-black/40 px-1 font-mono">help</kbd> to list
                  commands again.
                </p>
              ) : (
                history.map((line, i) => (
                  <div key={i} className="whitespace-pre-wrap break-words">
                    {line}
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={handleCommand}
              className="flex items-center gap-2 border-t border-white/10 bg-black/20 p-4"
            >
              <span className="text-primary" aria-hidden>
                ❯
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => {
                  tabCycleRef.current = 0;
                  setInput(e.target.value);
                }}
                onKeyDown={handleInputKeyDown}
                className="flex-1 border-none bg-transparent text-white outline-none placeholder:text-gray-600 focus-visible:ring-0"
                placeholder="Type 'help'… Tab completes"
                aria-label="Terminal command input"
                autoFocus
              />
            </form>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
};
