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
    const hide = setTimeout(() => setTooltip(false), 10000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [visible, phone]);

  if (!visible || !phone) return null;

  return (
    <a
      href={getWhatsAppLink(phone, 'Olá! Gostaria de saber mais informações sobre a Sauna e Espaço da Janice e verificar a disponibilidade para reserva.')}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 text-white shadow-2xl shadow-green-600/30 transition-all duration-300 hover:scale-110 hover:shadow-green-600/40 group sm:bottom-8 sm:right-8"
      title="Fale conosco pelo WhatsApp"
      onMouseEnter={() => setTooltip(true)}
      onMouseLeave={() => setTooltip(false)}
    >
      <div className="absolute inset-0 rounded-2xl bg-green-600 animate-ping opacity-20" />
      <MessageCircle className="h-7 w-7 relative z-10" />
      {tooltip && (
        <span className="absolute bottom-full right-0 mb-3 rounded-xl bg-dark-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xl whitespace-nowrap animate-fade-in">
          Fale conosco
          <span className="absolute -bottom-1 right-6 h-2 w-2 rotate-45 bg-dark-900" />
        </span>
      )}
    </a>
  );
}
