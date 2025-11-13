"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export function SplashProgress({ done }: { done: boolean }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (done) {
      queueMicrotask(() => setValue(100)); // FIX
      return;
    }

    let v = 0;
    const interval = setInterval(() => {
      // Increase slowly but never exceed 90
      v = Math.min(v + Math.random() * 5 + 3, 90);
      setValue(v);
    }, 120);

    return () => clearInterval(interval);
  }, [done]);

  return (
    <div className="w-64">
      <Progress value={value} />
      <p className="text-center mt-2 text-sm text-muted-foreground">{Math.round(value)}%</p>
    </div>
  );
}
