"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, MessageSquare, Target, Calendar, Sparkles, Milestone } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
        setLoading(false);
      });
  }, []);

  const markAsRead = async (id?: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(id ? { id } : {}),
    });
    setNotifications((prev) =>
      prev.map((n) => (id ? (n.id === id ? { ...n, isRead: true } : n) : { ...n, isRead: true }))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "MESSAGE": return <MessageSquare className="w-5 h-5 text-blue-500" />;
      case "MATCH": return <Target className="w-5 h-5 text-purple-500" />;
      case "SESSION": return <Calendar className="w-5 h-5 text-emerald-500" />;
      case "EVALUATION": return <Sparkles className="w-5 h-5 text-amber-500" />;
      case "MILESTONE": return <Milestone className="w-5 h-5 text-indigo-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6" style={{ color: "var(--color-brand-500)" }} /> Notifications
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Stay updated on your incubation journey</p>
        </div>
        <button onClick={() => markAsRead()} className="text-sm font-medium hover:underline" style={{ color: "var(--color-brand-500)" }}>
          Mark all as read
        </button>
      </div>

      <div className="card divide-y" style={{ borderColor: "var(--border-primary)", padding: 0 }}>
        {loading ? (
          <div className="p-8 text-center text-[var(--text-muted)]">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-[var(--text-muted)]">No notifications yet</div>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className={`p-4 flex gap-4 transition-colors ${notif.isRead ? "opacity-70" : "bg-[var(--bg-secondary)]"}`}>
              <div className="mt-1 flex-shrink-0">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm ${notif.isRead ? "font-medium" : "font-bold"}`}>{notif.title}</h3>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>{notif.message}</p>
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                  {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString()}
                </p>
                {notif.actionUrl && (
                  <Link href={notif.actionUrl} onClick={() => markAsRead(notif.id)} className="inline-block mt-3 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--color-brand-600)] text-white hover:bg-[var(--color-brand-500)] transition-colors">
                    View Details
                  </Link>
                )}
              </div>
              {!notif.isRead && (
                <button onClick={() => markAsRead(notif.id)} className="flex-shrink-0 self-center" title="Mark as read">
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-brand-500)] hover:text-[var(--color-brand-600)]" />
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
