'use client';

import { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '@/lib/utils';

export default function WhatsAppButton() {
  const [phone, setPhone] = useState('');
  const [visible, setVisible] = useState(false);
  const [tooltip, setTooltip] = useState(false);

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

  useEffect(() => {
    if (!visible || !phone) return;
    const show = setTimeout(() => setTooltip(true), 4000);
    const hide = setTimeout(() => setTooltip(false), 12000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [visible, phone]);

  if (!visible || !phone) return null;

  return (
    <a
      href={getWhatsAppLink(phone, 'Olá! Gostaria de reservar na Sauna e Espaço da Janice. Podem me ajudar?')}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white shadow-2xl shadow-green-600/40 transition-all duration-300 hover:scale-110 hover:bg-green-500 hover:shadow-green-500/50 group sm:bottom-8 sm:right-8"
      title="Reservar pelo WhatsApp"
      onMouseEnter={() => setTooltip(true)}
      onMouseLeave={() => setTooltip(false)}
    >
      <div className="absolute inset-0 rounded-full bg-green-600 animate-ping opacity-20" />
      <MessageCircle className="h-7 w-7 relative z-10" />
      {tooltip && (
        <span className="absolute bottom-full right-0 mb-3 rounded-xl bg-dark-900 px-5 py-3 text-sm font-semibold text-white shadow-2xl whitespace-nowrap animate-fade-in">
          <span className="block text-green-400 text-xs font-bold mb-1">Reservar agora</span>
          Fale conosco pelo WhatsApp
          <span className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 bg-dark-900" />
        </span>
      )}
    </a>
  );
}
