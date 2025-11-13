"use client";
import Lottie from "lottie-react";
import { useState, useEffect } from "react";

export function LottieLoader() {
  const [data, setData] = useState<unknown>(null); // FIX

  useEffect(() => {
    fetch("/animations/loading.json")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(console.error);
  }, []);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-lg text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="w-56 h-56">
        <Lottie animationData={data as object} loop autoplay />
      </div>
      <p className="text-lg text-muted-foreground">Loading Artworks…</p>
    </div>
  );
}
