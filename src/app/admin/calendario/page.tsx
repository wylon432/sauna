'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Unlock,
  X,
} from 'lucide-react';
import { formatDate, RESERVATION_STATUS } from '@/lib/utils';

interface DayInfo {
  date: string;
  reservations: { id: string; status: string; user: { name: string }; package?: { name: string } }[];
  block?: { id: string; blocked: boolean; reason?: string };
  saunaReservations?: { id: string; status: string; user: { name: string }; schedule?: { gender: string; startTime: string; endTime: string } }[];
}

export default function CalendarioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState<Record<string, DayInfo>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    setLoading(true);
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0).toISOString();
    fetch(`/api/admin/calendar?start=${start}&end=${end}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [currentDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const handleToggleBlock = async (dateStr: string) => {
    await fetch('/api/admin/calendar/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr, reason: blockReason }),
    });
    setBlockReason('');
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const start = new Date(year, month, 1).toISOString();
    const end = new Date(year, month + 1, 0).toISOString();
    const d = await fetch(`/api/admin/calendar?start=${start}&end=${end}`).then((r) => r.json());
    setData(d);
    setSelectedDate(null);
  };

  const getDayColor = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayData = data[dateStr];
    if (!dayData) return '';
    if (dayData.block?.blocked) return 'bg-dark-300 text-dark-700';
    if (dayData.reservations.some((r) => r.status === 'CONFIRMED')) return 'bg-red-200 text-red-900';
    if (dayData.reservations.some((r) => r.status === 'PRE_RESERVED' || r.status === 'REQUESTED')) return 'bg-amber-200 text-amber-900';
    if (dayData.saunaReservations && dayData.saunaReservations.length > 0) return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };

  const selectedData = selectedDate ? data[selectedDate] : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-dark-900">Calendário</h1>

      <div className="admin-card">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => setCurrentDate(new Date(year, month - 1))} className="rounded p-2 hover:bg-dark-100">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="text-lg font-semibold">{monthNames[month]} {year}</h2>
          <button onClick={() => setCurrentDate(new Date(year, month + 1))} className="rounded p-2 hover:bg-dark-100">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-green-100 border border-green-300"></span> Disponível</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-200 border border-amber-300"></span> Pré-reserva</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-red-200 border border-red-300"></span> Confirmada</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-blue-100 border border-blue-300"></span> Sauna</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-dark-300 border border-dark-400"></span> Bloqueada</span>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
            <div key={d} className="p-2 text-center text-xs font-semibold text-dark-500">{d}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2"></div>
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = data[dateStr];
            const colorClass = getDayColor(day);
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative rounded-lg p-2 text-sm transition-all hover:ring-2 hover:ring-brand-400 ${colorClass} ${selectedDate === dateStr ? 'ring-2 ring-brand-600' : ''}`}
              >
                {day}
                {dayData?.reservations?.length ? (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] text-white">
                    {dayData.reservations.length}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="admin-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{formatDate(selectedDate)}</h3>
            <button onClick={() => setSelectedDate(null)} className="text-dark-400 hover:text-dark-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-2">
            <input className="input flex-1" placeholder="Motivo do bloqueio..." value={blockReason} onChange={(e) => setBlockReason(e.target.value)} />
            {selectedData?.block?.blocked ? (
              <button onClick={() => handleToggleBlock(selectedDate)} className="btn-secondary">
                <Unlock className="mr-2 h-4 w-4" /> Desbloquear
              </button>
            ) : (
              <button onClick={() => handleToggleBlock(selectedDate)} className="btn-danger">
                <Lock className="mr-2 h-4 w-4" /> Bloquear
              </button>
            )}
          </div>

          {selectedData?.reservations?.length ? (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-dark-400">Aluguéis</p>
              {selectedData.reservations.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-dark-100 p-3">
                  <div>
                    <p className="text-sm font-medium">{r.user?.name}</p>
                    <p className="text-xs text-dark-500">{r.package?.name || 'Sauna'}</p>
                  </div>
                  <span className={`badge ${RESERVATION_STATUS[r.status]?.color || 'bg-dark-100'}`}>
                    {RESERVATION_STATUS[r.status]?.label || r.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-dark-500">Nenhum aluguel nesta data.</p>
          )}

          {selectedData?.saunaReservations && selectedData.saunaReservations.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase text-dark-400">Sauna</p>
              {selectedData.saunaReservations.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-dark-100 p-3">
                  <div>
                    <p className="text-sm font-medium">{r.user?.name}</p>
                    <p className="text-xs text-dark-500">
                      {r.schedule?.gender === 'FEMININO' ? 'Feminino' : 'Masculino'}
                      {r.schedule?.startTime ? ` • ${r.schedule.startTime}-${r.schedule.endTime}` : ''}
                    </p>
                  </div>
                  <span className={`badge ${RESERVATION_STATUS[r.status]?.color || 'bg-dark-100'}`}>
                    {RESERVATION_STATUS[r.status]?.label || r.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {selectedData?.block?.blocked && (
            <div className="rounded-lg border border-dark-200 bg-dark-50 p-3">
              <p className="text-sm text-dark-600">
                <Lock className="mr-1 inline h-3 w-3" />
                Bloqueado{selectedData.block.reason ? `: ${selectedData.block.reason}` : ''}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
