"use client";

import { useEffect, useRef } from "react";
import { pingPresence } from "@/app/presence/actions";

const PRESENCE_INTERVAL_MS = 60_000;
const STORAGE_KEY = "t3_presence_sid";

export function PresenceHeartbeat() {
  const lastPing = useRef<number>(0);
  const sid = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      sid.current = saved;
    } else {
      try {
        const id = crypto.randomUUID();
        sid.current = id;
        sessionStorage.setItem(STORAGE_KEY, id);
      } catch {
        // crypto.randomUUID unavailable in very old browsers; skip silently.
        return;
      }
    }

    const send = async () => {
      if (document.hidden || !sid.current) return;
      const now = Date.now();
      if (now - lastPing.current < PRESENCE_INTERVAL_MS) return;
      lastPing.current = now;
      try {
        await pingPresence(sid.current);
      } catch {
        // Do not surface network/config errors to the visitor.
      }
    };

    send();
    const interval = setInterval(send, PRESENCE_INTERVAL_MS);
    const onVisibility = () => {
      if (!document.hidden) send();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return null;
}
