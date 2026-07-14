import React, { useState, useEffect } from "react";

interface TypingTextProps {
  text: string;
  speed?: number; // millisecond delay per character
  onComplete?: () => void;
  className?: string;
}

/**
 * High-performance typing animation component.
 * Uses robust React lifecycle hooks to guarantee zero memory leaks
 * and automatic interval cleanup when unmounted (Milk Zen Compliant).
 */
export const TypingText: React.FC<TypingTextProps> = ({
  text,
  speed = 15,
  onComplete,
  className = "",
}) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    setDisplayedText("");
    
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      
      if (index >= text.length) {
        clearInterval(intervalId);
        if (onComplete) {
          onComplete();
        }
      }
    }, speed);

    // Garbage-free cleanup to prevent memory leaks and keep loop purity
    return () => clearInterval(intervalId);
  }, [text, speed, onComplete]);

  return <span className={className}>{displayedText}</span>;
};
