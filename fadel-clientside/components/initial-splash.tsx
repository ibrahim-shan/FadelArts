"use client";

import { useEffect, useState, useRef } from "react";
import { LottieLoader } from "./lottie-loader";
import { SplashProgress } from "./SplashProgress";

const COOKIE_NAME = "fadel_initial_splash";
const MIN = 3000;
const BUFFER = 300;

export function InitialSplash() {
  const [shouldRender, setShouldRender] = useState(true);
  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState(false);

  const minDone = useRef(false);
  const loadDone = useRef(false);

  useEffect(() => {
    const hasSeen = document.cookie.includes(`${COOKIE_NAME}=1`);

    if (hasSeen) {
      // FIX: asynchronous state update
      queueMicrotask(() => setShouldRender(false));
      return;
    }

    document.cookie = `${COOKIE_NAME}=1; path=/`;

    const minTimer = setTimeout(() => {
      minDone.current = true;
      if (loadDone.current) hide();
    }, MIN);

    const onLoaded = () => {
      loadDone.current = true;
      if (minDone.current) hide();
    };

    if (document.readyState === "complete") {
      onLoaded();
    } else {
      window.addEventListener("load", onLoaded);
    }

    function hide() {
      queueMicrotask(() => setDone(true)); // FIX
      queueMicrotask(() => setVisible(false)); // FIX
      setTimeout(() => setShouldRender(false), BUFFER);
    }

    return () => {
      clearTimeout(minTimer);
      window.removeEventListener("load", onLoaded);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <LottieLoader />
        <SplashProgress done={done} />
      </div>
    </div>
  );
}
