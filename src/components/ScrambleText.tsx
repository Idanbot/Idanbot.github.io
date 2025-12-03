import { useState, useEffect, useRef } from 'react';

interface ScrambleTextProps {
  text: string;
  className?: string;
  interval?: number;
  hoverTrigger?: boolean;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+';

export const ScrambleText = ({ text, className, interval = 30, hoverTrigger = false }: ScrambleTextProps) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const scramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);

    let iteration = 0;

    // Create a static buffer of random characters for the "future" text
    const staticBuffer = text.split('').map(() => CHARS[Math.floor(Math.random() * CHARS.length)]);

    clearInterval(intervalRef.current as number);

    intervalRef.current = window.setInterval(() => {
      setDisplayText(() =>
        text.split('')
          .map((_char, index) => {
            if (index < Math.floor(iteration)) {
              return text[index];
            }
            // Only scramble the character currently being revealed
            if (index === Math.floor(iteration)) {
              return CHARS[Math.floor(Math.random() * CHARS.length)];
            }
            // Return the static random character for future letters
            return staticBuffer[index];
          })
          .join('')
      );

      if (iteration >= text.length) {
        clearInterval(intervalRef.current as number);
        setIsScrambling(false);
        setDisplayText(text); // Ensure final text is correct
      }

      iteration += 0.5;
    }, interval);
  };

  useEffect(() => {
    scramble();
    return () => clearInterval(intervalRef.current as number);
  }, [text, interval]);

  return (
    <span
      className={`inline-block font-mono cursor-default ${className}`}
      onMouseEnter={() => {
        if (hoverTrigger) {
          scramble();
        }
      }}
    >
      {displayText}
    </span>
  );
};
