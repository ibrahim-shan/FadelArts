"use client";

import { useEffect } from "react";
import { scroller } from "react-scroll";

export default function HashScroll({ offset = -64, duration = 500 }: { offset?: number; duration?: number }) {
  useEffect(() => {
    const doScroll = () => {
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (hash && hash.length > 1) {
        const id = hash.slice(1);
        // Use react-scroll to animate to the element id
        scroller.scrollTo(id, { smooth: true, duration, offset });
      }
    };
    // Delay a tick to ensure elements are mounted
    const t = setTimeout(doScroll, 50);
    window.addEventListener("hashchange", doScroll);
    return () => {
      clearTimeout(t);
      window.removeEventListener("hashchange", doScroll);
    };
  }, [offset, duration]);
  return null;
}

