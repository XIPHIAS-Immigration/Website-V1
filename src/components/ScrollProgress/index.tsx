"use client";

import { useEffect, useState } from "react";

interface ScrollProgressProps {
  targetId?: string; // optional: track scroll of a specific container
}

export default function ScrollProgress({ targetId }: ScrollProgressProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const target = targetId ? document.getElementById(targetId) : null;

    const getProgress = () => {
      if (target) {
        const totalHeight = target.scrollHeight - target.clientHeight;
        const scrollTop = target.scrollTop;
        return totalHeight > 0 ? (scrollTop / totalHeight) * 100 : 0;
      } else {
        const totalHeight =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        const scrollTop = window.scrollY;
        return totalHeight > 0 ? (scrollTop / totalHeight) * 100 : 0;
      }
    };

    const handleScroll = () => setProgress(getProgress());

    handleScroll(); // initial

    if (target) {
      target.addEventListener("scroll", handleScroll, { passive: true });
      return () => target.removeEventListener("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [targetId]);

  return (
    <div className="w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-full mb-4 overflow-hidden">
      <div
        className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-200"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
