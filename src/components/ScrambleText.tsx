import { useState, useEffect, useRef } from 'react';

interface ScrambleTextProps {
  text: string;
  className?: string;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*()_+';

export const ScrambleText = ({ text, className }: ScrambleTextProps) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const scramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);
    
    let iteration = 0;
    
    clearInterval(intervalRef.current as number);
    
    intervalRef.current = window.setInterval(() => {
      setDisplayText(() => 
        text.split('')
          .map((_char, index) => {
            if (index < iteration) return text[index];
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join('')
      );
      
      if (iteration >= text.length) {
        clearInterval(intervalRef.current as number);
        setIsScrambling(false);
      }
      
      iteration += 1/3;
    }, 30);
  };

  useEffect(() => {
    scramble();
    return () => clearInterval(intervalRef.current as number);
  }, [text]);

  return (
    <span 
      className={`inline-block font-mono cursor-default ${className}`}
      onMouseEnter={scramble}
    >
      {displayText}
    </span>
  );
};
