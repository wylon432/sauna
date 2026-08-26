'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function getDayStatus(
  date: Date,
  blocks: CalendarBlockData[],
  reservations: RentalReservationData[]
): 'available' | 'pre_reserved' | 'confirmed' | 'blocked' | null {
  const dateStr = date.toISOString().split('T')[0];

  const block = blocks.find((b) => {
    const blockDate = new Date(b.date).toISOString().split('T')[0];
    return blockDate === dateStr;
  });

  if (block && block.blocked) return 'blocked';

  const reservation = reservations.find((r) => {
    const resDate = new Date(r.date).toISOString().split('T')[0];
    return resDate === dateStr;
  });

  if (reservation) {
    if (['REQUESTED', 'PRE_RESERVED', 'AWAITING_SIGNAL'].includes(reservation.status)) {
      return 'pre_reserved';
    }
    return 'confirmed';
  }

  return null;
}

function getStatusStyle(status: string | null): string {
  switch (status) {
    case 'blocked':
      return 'bg-gray-200 text-gray-500 font-semibold';
    case 'pre_reserved':
      return 'bg-amber-100 text-amber-700 font-semibold ring-1 ring-amber-200';
    case 'confirmed':
      return 'bg-red-100 text-red-700 font-semibold ring-1 ring-red-200';
    default:
      return 'bg-green-50 text-green-700 hover:bg-green-100 hover:ring-1 hover:ring-green-200 cursor-pointer';
  }
}

export default function DisponibilidadeClient({ calendarBlocks, rentalReservations }: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  const days = useMemo(() => {
    const result: (number | null)[] = [];
    for (let i = 0; i < firstDayOfWeek; i++) result.push(null);
    for (let d = 1; d <= daysInMonth; d++) result.push(d);
    return result;
  }, [firstDayOfWeek, daysInMonth]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div>
      {/* Month Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h3 className="text-lg font-bold text-gray-900">
          {MONTHS[currentMonth]} {currentYear}
        </h3>
        <button
          onClick={nextMonth}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="mb-2 grid grid-cols-7 gap-1.5 text-center">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
          <div key={day} className="py-2 text-xs font-bold uppercase tracking-wider text-gray-400">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const date = new Date(currentYear, currentMonth, day);
          const status = getDayStatus(date, calendarBlocks, rentalReservations);
          const isPast = date < today;
          const isToday = date.getTime() === today.getTime();

          return (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center rounded-xl text-sm transition-all duration-200 ${
                isPast
                  ? 'text-gray-300'
                  : getStatusStyle(status)
              } ${isToday ? 'ring-2 ring-amber-400 ring-offset-1' : ''}`}
              title={
                status === 'blocked'
                  ? 'Bloqueada'
                  : status === 'pre_reserved'
                  ? 'Pré-reserva'
                  : status === 'confirmed'
                  ? 'Confirmada'
                  : 'Disponível'
              }
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
