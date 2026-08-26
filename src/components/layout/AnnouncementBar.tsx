'use client';

import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface Announcement {
  id: string;
  text: string;
  service: string;
  startDate: string;
  endDate: string;
}

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/announcements')
      .then((r) => r.json())
      .then((data) => setAnnouncements(data.announcements || data || []))
      .catch(() => {});
  }, []);

  const visible = announcements.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="bg-brand-600 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <div className="flex gap-4 overflow-x-auto text-sm font-medium">
            {visible.map((a) => (
              <span key={a.id} className="whitespace-nowrap">{a.text}</span>
            ))}
          </div>
        </div>
        <button onClick={() => setDismissed(visible.map((a) => a.id))} className="ml-4 shrink-0 rounded-lg p-1 transition-colors hover:bg-white/20">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
