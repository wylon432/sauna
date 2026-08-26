import { CalendarDays, Clock, Sparkles } from 'lucide-react';
import prisma from '@/lib/prisma';
import { GENDERS, DAYS_OF_WEEK, formatDate } from '@/lib/utils';
import DisponibilidadeClient from './DisponibilidadeClient';

export const metadata = {
  title: 'Disponibilidade | Sauna e Espaço da Janice',
  description: 'Confira a disponibilidade da sauna e do espaço para aluguel.',
};

export default async function DisponibilidadePage() {
  const [schedules, calendarBlocks, rentalReservations] = await Promise.all([
    prisma.saunaSchedule.findMany({
      where: { active: true },
      orderBy: [{ dayOfWeek: 'asc' }, { gender: 'asc' }],
    }),
    prisma.calendarBlock.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' },
    }),
    prisma.rentalReservation.findMany({
      where: {
        status: { in: ['REQUESTED', 'PRE_RESERVED', 'CONFIRMED', 'AWAITING_SIGNAL', 'PARTIAL_PAYMENT', 'FULL_PAYMENT'] },
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
      include: { package: true },
    }),
  ]);

  const groupedSchedules = schedules.reduce<Record<number, typeof schedules>>((acc, s) => {
    if (!acc[s.dayOfWeek]) acc[s.dayOfWeek] = [];
    acc[s.dayOfWeek].push(s);
    return acc;
  }, {});

  const serializedBlocks = calendarBlocks.map((b) => ({
    id: b.id,
    date: b.date.toISOString(),
    service: b.service,
    blocked: b.blocked,
    reason: b.reason,
  }));

  const serializedReservations = rentalReservations.map((r) => ({
    id: r.id,
    date: r.date.toISOString(),
    endDate: r.endDate?.toISOString() || null,
    status: r.status,
    packageName: r.package?.name || '',
  }));

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-purple-900 to-slate-900 px-4 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('/img/pattern.svg')] opacity-5" />
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-600/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm">
            <CalendarDays className="h-4 w-4" />
            Confira as datas
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Disponibilidade
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/70">
            Confira a disponibilidade da sauna e do espaço para aluguel.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Sauna Schedule */}
        <div className="mb-20">
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Horários da Sauna</h2>
                <p className="text-sm text-gray-500">Funcionamento por gênero</p>
              </div>
            </div>
          </div>

          {schedules.length === 0 ? (
            <div className="mx-auto max-w-lg text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100">
                <Clock className="h-10 w-10 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Horários em breve</h3>
              <p className="mt-3 text-gray-500">Horários ainda não disponíveis.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(groupedSchedules)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([day, daySchedules]) => (
                  <div
                    key={day}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4">
                      <h3 className="text-lg font-bold text-white">
                        {DAYS_OF_WEEK[Number(day)] || `Dia ${day}`}
                      </h3>
                    </div>
                    <div className="p-5 space-y-3">
                      {daySchedules.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                        >
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                              s.gender === 'FEMININO'
                                ? 'bg-pink-100 text-pink-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {GENDERS[s.gender] || s.gender}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            {s.startTime} - {s.endTime}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Rental Calendar */}
        <div>
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <CalendarDays className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Calendário de Aluguel</h2>
                <p className="text-sm text-gray-500">Datas disponíveis e bloqueadas</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="p-6 sm:p-8">
              <DisponibilidadeClient
                calendarBlocks={serializedBlocks}
                rentalReservations={serializedReservations}
              />
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 flex flex-wrap items-center gap-6 rounded-2xl border border-gray-100 bg-white px-6 py-5 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900">Legenda:</h3>
            <div className="flex items-center gap-2.5">
              <span className="h-3.5 w-3.5 rounded-full bg-green-500 shadow-sm shadow-green-500/30" />
              <span className="text-sm text-gray-600">Disponível</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="h-3.5 w-3.5 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/30" />
              <span className="text-sm text-gray-600">Pré-reserva</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="h-3.5 w-3.5 rounded-full bg-red-500 shadow-sm shadow-red-500/30" />
              <span className="text-sm text-gray-600">Confirmada</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="h-3.5 w-3.5 rounded-full bg-gray-400 shadow-sm shadow-gray-400/30" />
              <span className="text-sm text-gray-600">Bloqueada</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
