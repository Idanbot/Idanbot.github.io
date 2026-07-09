import { useState, useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';

interface ScrambleTextProps {
  text: string;
  className?: string;
  interval?: number;
  hoverTrigger?: boolean;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+';

export const ScrambleText = ({
  text,
  className,
  interval = 30,
  hoverTrigger = false,
}: ScrambleTextProps) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const reduceMotion = usePrefersReducedMotion();

  const scramble = () => {
    if (reduceMotion) {
      setDisplayText(text);
      return;
    }
    if (isScrambling) return;
    setIsScrambling(true);

    let iteration = 0;
    const staticBuffer = text.split('').map(() => CHARS[Math.floor(Math.random() * CHARS.length)]);

    if (intervalRef.current != null) clearInterval(intervalRef.current);

    intervalRef.current = window.setInterval(() => {
      setDisplayText(() =>
        text
          .split('')
          .map((_char, index) => {
            if (index < Math.floor(iteration)) {
              return text[index];
            }
            if (index === Math.floor(iteration)) {
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            }
            return staticBuffer[index];
          })
          .join('')
      );

      if (iteration >= text.length) {
        if (intervalRef.current != null) clearInterval(intervalRef.current);
        setIsScrambling(false);
        setDisplayText(text);
      }

      iteration += 0.5;
    }, interval);
  };

  useEffect(() => {
    if (reduceMotion) {
      setDisplayText(text);
      return;
    }
    return () => {
      if (intervalRef.current != null) clearInterval(intervalRef.current);
    };
  // Initial text remains stable for SSR and first paint; scrambling is hover-only.
  }, [text, interval, reduceMotion]);

  return (
    <span
      className={`inline-block font-mono cursor-default ${className ?? ''}`}
      onMouseEnter={() => {
        if (hoverTrigger && !reduceMotion) {
          scramble();
        }
      }}
    >
      {displayText}
    </span>
  );
};
