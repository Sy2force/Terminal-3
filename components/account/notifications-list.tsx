"use client";

import { useState, useTransition } from "react";
import { markNotificationRead, markAllNotificationsRead } from "@/app/compte/actions";
import type { CustomerNotification } from "@/lib/data/customer-notifications";

export function NotificationsList({ initialNotifications }: { initialNotifications: CustomerNotification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [, startTransition] = useTransition();

  function handleMarkRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
    );
    startTransition(() => markNotificationRead(id));
  }

  function handleMarkAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() })));
    startTransition(() => markAllNotificationsRead());
  }

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div>
      {unreadCount > 0 && (
        <button
          type="button"
          onClick={handleMarkAllRead}
          className="mb-4 text-xs text-champagne hover:underline"
        >
          Tout marquer comme lu
        </button>
      )}
      {notifications.length === 0 ? (
        <p className="text-sm text-muted-grey">Aucune notification.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-white/5 border-y border-white/5">
          {notifications.map((n) => (
            <li
              key={n.id}
              onClick={() => !n.readAt && handleMarkRead(n.id)}
              className={`flex cursor-pointer flex-col gap-1 py-4 ${!n.readAt ? "bg-champagne/5" : ""}`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-sm ${n.readAt ? "text-ivory/60" : "font-medium text-ivory"}`}>
                  {n.title}
                </p>
                <span className="text-xs text-muted-grey">
                  {new Date(n.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
              {n.body && <p className="text-xs text-muted-grey">{n.body}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
