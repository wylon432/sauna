'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check, X as XIcon } from 'lucide-react';
import Link from 'next/link';

interface CalendarBlockData {
  id: string;
  date: string;
  service: string;
  blocked: boolean;
  reason: string | null;
}

interface RentalReservationData {
  id: string;
  date: string;
  endDate: string | null;
  status: string;
  packageName: string;
}

interface Props {
  calendarBlocks: CalendarBlockData[];
  rentalReservations: RentalReservationData[];
}

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function getStatus(
  date: Date,
  blocks: CalendarBlockData[],
  reservations: RentalReservationData[]
): { type: 'available' | 'pre_reserved' | 'confirmed' | 'blocked'; label: string } {
  const dateStr = date.toISOString().split('T')[0];

  const block = blocks.find((b) => new Date(b.date).toISOString().split('T')[0] === dateStr);
  if (block && block.blocked) return { type: 'blocked', label: block.reason || 'Bloqueada' };

  const reservation = reservations.find((r) => new Date(r.date).toISOString().split('T')[0] === dateStr);
  if (reservation) {
    if (['REQUESTED', 'PRE_RESERVED', 'AWAITING_SIGNAL'].includes(reservation.status)) {
      return { type: 'pre_reserved', label: `Pré-reserva${reservation.packageName ? ': ' + reservation.packageName : ''}` };
    }
    return { type: 'confirmed', label: `Confirmada${reservation.packageName ? ': ' + reservation.packageName : ''}` };
  }

  return { type: 'available', label: 'Disponível' };
}

export default function DisponibilidadeClient({ calendarBlocks, rentalReservations }: Props) {
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calendar = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [month, year]);

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const next = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  const getStyles = (status: string) => {
    switch (status) {
      case 'blocked': return 'bg-dark-200 text-dark-500 cursor-not-allowed';
      case 'pre_reserved': return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200';
      case 'confirmed': return 'bg-red-100 text-red-600 ring-1 ring-red-200';
      default: return 'bg-green-50 text-green-700 hover:bg-green-100 hover:ring-1 hover:ring-green-300 cursor-pointer';
    }
  };

  const selected = selectedDate
    ? getStatus(selectedDate, calendarBlocks, rentalReservations)
    : null;

  return (
    <div>
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Calendar Grid */}
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={prev} className="flex h-10 w-10 items-center justify-center rounded-xl bg-dark-100 text-dark-600 transition-colors hover:bg-dark-200">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-extrabold text-dark-900">
              {MONTHS_PT[month]} {year}
            </h3>
            <button onClick={next} className="flex h-10 w-10 items-center justify-center rounded-xl bg-dark-100 text-dark-600 transition-colors hover:bg-dark-200">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-bold uppercase text-dark-400">{d}</div>
            ))}
            {calendar.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;
              const date = new Date(year, month, day);
              const status = getStatus(date, calendarBlocks, rentalReservations);
              const isPast = date < today;
              const isToday = date.getTime() === today.getTime();
              const isSelected = selectedDate?.getTime() === date.getTime();

              return (
                <button
                  key={day}
                  disabled={isPast}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all duration-150
                    ${isPast ? 'text-dark-300 cursor-not-allowed' : getStyles(status.type)}
                    ${isToday ? 'ring-2 ring-brand-500 ring-offset-2' : ''}
                    ${isSelected && !isPast ? 'ring-2 ring-brand-600 scale-105' : ''}
                  `}
                  title={status.label}
                >
                  <span>{day}</span>
                  {!isPast && status.type !== 'available' && (
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-current" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Info */}
        <div className="lg:w-72">
          {selectedDate ? (
            <div className="rounded-2xl border border-dark-200 bg-white p-6 shadow-premium">
              <p className="text-sm font-bold text-dark-400 uppercase tracking-wider">
                {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <div className="mt-3 flex items-center gap-2">
                {selected!.type === 'available' && <Check className="h-5 w-5 text-green-600" />}
                {selected!.type !== 'available' && <XIcon className="h-5 w-5 text-red-500" />}
                <span className={`font-extrabold text-lg ${
                  selected!.type === 'available' ? 'text-green-700' :
                  selected!.type === 'blocked' ? 'text-dark-500' :
                  selected!.type === 'pre_reserved' ? 'text-amber-700' : 'text-red-600'
                }`}>
                  {selected!.type === 'available' ? 'Disponível' :
                   selected!.type === 'blocked' ? 'Bloqueada' :
                   selected!.type === 'pre_reserved' ? 'Pré-reserva' : 'Confirmada'}
                </span>
              </div>
              {selected!.label && selected!.type !== 'available' && (
                <p className="mt-2 text-sm text-dark-500">{selected!.label}</p>
              )}
              {selected!.type === 'available' && (
                <div className="mt-4 space-y-2">
                  <Link
                    href="/aluguel"
                    className="block w-full rounded-xl bg-brand-600 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                  >
                    Reservar para este dia
                  </Link>
                  <p className="text-center text-xs text-dark-400">Ou entre em contato pelo WhatsApp</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dark-100 bg-dark-50 p-6 text-center">
              <p className="text-sm text-dark-400">Clique em uma data para ver detalhes</p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 space-y-2 rounded-2xl border border-dark-200 bg-white p-4 shadow-premium">
            <p className="text-xs font-bold uppercase text-dark-400">Legenda</p>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-green-500" />
              <span className="text-sm text-dark-600">Disponível</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="text-sm text-dark-600">Pré-reserva</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500" />
              <span className="text-sm text-dark-600">Confirmada</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-dark-300" />
              <span className="text-sm text-dark-600">Bloqueada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
