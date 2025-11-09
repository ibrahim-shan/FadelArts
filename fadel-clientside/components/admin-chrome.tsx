"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AdminChromeController() {
  const pathname = usePathname();

  useEffect(() => {
    const isAdmin = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
    document.body.toggleAttribute("data-admin", isAdmin);
    return () => {
      document.body.removeAttribute("data-admin");
    };
  }, [pathname]);

  return null;
}

