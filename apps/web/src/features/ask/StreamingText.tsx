import { useEffect, useState } from "react";

interface StreamingTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export function StreamingText({ text, speed = 20, onComplete }: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return (
    <span className="whitespace-pre-line">
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-1.5 h-4 bg-copper ml-0.5 animate-pulse" />
      )}
    </span>
  );
}
