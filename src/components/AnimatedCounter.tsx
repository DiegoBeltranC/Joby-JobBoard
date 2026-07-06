"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  target: number;
  duration?: number; // duration in ms
  prefix?: string;
}

export function AnimatedCounter({ target, duration = 1500, prefix = "" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTimestamp: number | null = null;

          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // Easing function (easeOutQuad) for smooth deceleration
            const easeProgress = progress * (2 - progress);
            
            setCount(Math.floor(easeProgress * target));

            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(target);
            }
          };

          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = elementRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [target, duration]);

  return (
    <span ref={elementRef} className="tabular-nums">
      {prefix}
      {count}
    </span>
  );
}
