'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/utils';

export default function WhatsAppButton() {
  const [phone, setPhone] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        const s = data.settings || data || [];
        const main = Array.isArray(s) ? s.find((x: any) => x.key === 'whatsapp_main') : null;
        if (main) setPhone(main.value);
      })
      .catch(() => {});

    const timer = setTimeout(() => setVisible(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible || !phone) return null;

  return (
    <a
      href={getWhatsAppLink(phone, 'Olá! Gostaria de mais informações.')}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 text-white shadow-2xl shadow-green-600/30 transition-all duration-300 hover:scale-110 hover:shadow-green-600/40 group"
      title="Fale conosco"
    >
      <div className="absolute inset-0 rounded-2xl bg-green-600 animate-ping opacity-20" />
      <MessageCircle className="h-7 w-7 relative z-10" />
      <span className="absolute right-full mr-3 rounded-xl bg-dark-900 px-4 py-2 text-sm font-semibold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 whitespace-nowrap shadow-xl">
        Fale conosco
      </span>
    </a>
  );
}
