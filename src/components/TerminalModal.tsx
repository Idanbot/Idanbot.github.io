import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, m, useReducedMotion } from 'framer-motion';
import { Terminal as TerminalIcon, X } from 'lucide-react';
import { SystemMonitor } from './SystemMonitor';
import { MotionBoundary } from './MotionBoundary';
import { OPEN_TERMINAL_EVENT } from '@/lib/site-events';
import {
  applyBrowserTerminalEffect,
  createBrowserTerminalEngine,
} from '@/lib/terminalBrowser';

const initialHistory = [
  'Welcome to IdanBot Term v1.0.0',
  'Type "help" for available commands. Press Tab to complete commands or cat(1) filenames.',
];

type TerminalModalProps = { startOpen?: boolean };

const TerminalModalContent = ({ startOpen = false }: TerminalModalProps) => {
  const engine = useMemo(() => createBrowserTerminalEngine(), []);
  const [isOpen, setIsOpen] = useState(startOpen);
  const [showMonitor, setShowMonitor] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>(initialHistory);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [temporaryInput, setTemporaryInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const tabCycleRef = useRef(0);
  const reduceMotion = useReducedMotion();

  const executeCommand = useCallback(
    async (commandText: string) => {
      const trimmedInput = commandText.trim();
      if (!trimmedInput) return;

      setHistory((previous) => [...previous, `> ${trimmedInput}`]);
      const pendingMessage = engine.pendingMessage(trimmedInput);
      if (pendingMessage) setHistory((previous) => [...previous, pendingMessage]);

      const execution = await engine.execute(trimmedInput);
      if (!execution) return;

      if (execution.output) {
        setHistory((previous) => [...previous, execution.output ?? '']);
      }

      applyBrowserTerminalEffect(execution.effect, {
        clear: () => setHistory([]),
        close: () => setIsOpen(false),
        openMonitor: () => setShowMonitor(true),
      });

      setInput('');
      if (execution.recordHistory) {
        setCommandHistory((previous) => [...previous.slice(-49), trimmedInput]);
        setHistoryIndex(-1);
        setTemporaryInput('');
      }
    },
    [engine]
  );

  useEffect(() => {
    const openFromChrome = (event: Event) => {
      const customEvent = event as CustomEvent<{ command?: string }>;
      const command = customEvent.detail?.command ?? window.__pendingTerminalCommand;
      setIsOpen(true);
      if (command) {
        delete window.__pendingTerminalCommand;
        void executeCommand(command);
      }
    };
    window.addEventListener(OPEN_TERMINAL_EVENT, openFromChrome);
    return () => window.removeEventListener(OPEN_TERMINAL_EVENT, openFromChrome);
  }, [executeCommand]);

  useEffect(() => {
    if (!isOpen || showMonitor) return;
    const pending = window.__pendingTerminalCommand;
    if (!pending) return;
    delete window.__pendingTerminalCommand;
    void executeCommand(pending);
  }, [executeCommand, isOpen, showMonitor]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showMonitor) {
        setShowMonitor(false);
        event.preventDefault();
        return;
      }
      if (event.key === '`' || event.key === '~') {
        event.preventDefault();
        setIsOpen((previous) => !previous);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMonitor]);

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      if (!showMonitor) inputRef.current?.focus();
      return;
    }

    previousFocusRef.current?.focus();
    previousFocusRef.current = null;
  }, [isOpen, showMonitor]);

  useEffect(() => {
    if (!isOpen || showMonitor) return;

    const handleFocusTrap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab' || !modalRef.current) return;
      const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select'
      );
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        event.preventDefault();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        if (document.activeElement === inputRef.current) return;
        firstElement.focus();
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleFocusTrap);
    return () => window.removeEventListener('keydown', handleFocusTrap);
  }, [isOpen, showMonitor]);

  useEffect(() => {
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, [history]);

  const applyTabCompletion = () => {
    const completion = engine.complete(input, tabCycleRef.current);
    setInput(completion.input);
    tabCycleRef.current = completion.nextCycle;
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      if (isOpen && !showMonitor) applyTabCompletion();
      return;
    }

    tabCycleRef.current = 0;
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen || showMonitor || commandHistory.length === 0) return;

      let nextIndex: number;
      if (historyIndex === -1) {
        setTemporaryInput(input);
        nextIndex = commandHistory.length - 1;
      } else if (historyIndex > 0) {
        nextIndex = historyIndex - 1;
      } else {
        return;
      }
      setHistoryIndex(nextIndex);
      setInput(commandHistory[nextIndex]);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!isOpen || showMonitor || historyIndex === -1) return;

      if (historyIndex === commandHistory.length - 1) {
        setHistoryIndex(-1);
        setInput(temporaryInput);
      } else {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(commandHistory[nextIndex]);
      }
    }
  };

  return (
    <AnimatePresence>
      {showMonitor ? (
        <m.div
          initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
          transition={reduceMotion ? { duration: 0.12 } : undefined}
          className="fixed inset-0 z-[200] flex cursor-pointer items-center justify-center bg-black/90 p-4 backdrop-blur-sm md:p-10"
          onClick={() => setShowMonitor(false)}
        >
          <div className="w-full max-w-7xl" onClick={(event) => event.stopPropagation()}>
            <SystemMonitor />
            <p className="mt-4 animate-pulse text-center text-gray-500">
              Press any key or click anywhere to close session
            </p>
          </div>
        </m.div>
      ) : null}

      {isOpen && !showMonitor ? (
        <m.div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/48 p-3 pt-[min(8vh,4rem)] backdrop-blur-sm sm:p-6 md:items-center md:pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0.08 : 0.16 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <m.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Terminal"
            initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96 }}
            transition={
              reduceMotion
                ? { duration: 0.12 }
                : { type: 'spring', damping: 26, stiffness: 240 }
            }
            className="liquid-glass z-[1] flex h-[min(78dvh,34rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl font-mono text-sm md:text-base"
          >
            <div className="relative z-[1] flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-2">
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
              className="relative z-[1] flex-1 space-y-2 overflow-y-auto p-4 text-gray-300"
              onClick={() => inputRef.current?.focus()}
              aria-live="polite"
              aria-relevant="additions"
            >
              {history.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Screen cleared. Type{' '}
                  <kbd className="rounded border border-white/15 bg-black/40 px-1 font-mono">
                    help
                  </kbd>{' '}
                  to list commands again.
                </p>
              ) : (
                history.map((line, index) => (
                  <div key={`${index}-${line.slice(0, 12)}`} className="whitespace-pre-wrap break-words">
                    {line}
                  </div>
                ))
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void executeCommand(input);
              }}
              className="relative z-[1] flex items-center gap-2 border-t border-white/10 bg-black/20 p-4"
            >
              <span className="text-primary" aria-hidden>
                &gt;
              </span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => {
                  tabCycleRef.current = 0;
                  setInput(event.target.value);
                }}
                onKeyDown={handleInputKeyDown}
                className="flex-1 border-none bg-transparent text-white outline-none placeholder:text-gray-600 focus-visible:ring-0"
                placeholder="Type 'help'... Tab completes"
                aria-label="Terminal command input"
                autoFocus
              />
            </form>
          </m.div>
        </m.div>
      ) : null}
    </AnimatePresence>
  );
};

export const TerminalModal = (props: TerminalModalProps) => (
  <MotionBoundary>
    <TerminalModalContent {...props} />
  </MotionBoundary>
);
