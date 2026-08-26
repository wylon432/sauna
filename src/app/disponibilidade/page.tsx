import { CalendarDays, Clock, Sparkles } from 'lucide-react';
import prisma from '@/lib/prisma';
import { GENDERS, DAYS_OF_WEEK, formatDate } from '@/lib/utils';
import DisponibilidadeClient from './DisponibilidadeClient';

export const dynamic = 'force-dynamic';

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
      <section className="relative overflow-hidden bg-gradient-to-b from-white via-brand-50/30 to-white px-4 py-20 sm:py-28">
        <div className="absolute inset-0">
          <div className="absolute left-[10%] top-[20%] h-[400px] w-[400px] rounded-full bg-brand-500/8 blur-[120px] animate-glow-pulse" />
          <div className="absolute bottom-[10%] right-[10%] h-[300px] w-[300px] rounded-full bg-brand-400/6 blur-[100px] animate-glow-pulse [animation-delay:1.5s]" />
        </div>
        <div className="relative mx-auto max-w-7xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-100/60 px-4 py-2 text-sm font-semibold text-brand-700">
            <CalendarDays className="h-4 w-4" />
            Confira as datas
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-dark-900 sm:text-5xl lg:text-6xl">
            Disponibilidade
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-dark-600">
            Confira a disponibilidade da sauna e do espaço para aluguel.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        {/* Sauna Schedule */}
        <div className="mb-20">
          <div className="mb-10">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                <Clock className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-dark-900">Horários da Sauna</h2>
                <p className="text-sm text-dark-500">Funcionamento por gênero</p>
              </div>
            </div>
          </div>

          {schedules.length === 0 ? (
            <div className="mx-auto max-w-lg text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-100">
                <Clock className="h-10 w-10 text-brand-600" />
              </div>
              <h3 className="text-xl font-extrabold text-dark-900">Horários em breve</h3>
              <p className="mt-3 text-dark-500">Horários ainda não disponíveis.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Object.entries(groupedSchedules)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([day, daySchedules]) => (
                  <div
                    key={day}
                    className="overflow-hidden rounded-2xl border border-dark-200 bg-white shadow-premium transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg"
                  >
                    <div className="bg-brand-600 px-6 py-4">
                      <h3 className="text-lg font-extrabold text-white">
                        {DAYS_OF_WEEK[Number(day)] || `Dia ${day}`}
                      </h3>
                    </div>
                    <div className="p-5 space-y-3">
                      {daySchedules.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between rounded-xl bg-dark-50 px-4 py-3"
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
                          <span className="text-sm font-bold text-dark-900">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100">
                <CalendarDays className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-dark-900">Calendário de Aluguel</h2>
                <p className="text-sm text-dark-500">Datas disponíveis e bloqueadas</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-dark-200 bg-white shadow-premium">
            <div className="p-6 sm:p-8">
              <DisponibilidadeClient
                calendarBlocks={serializedBlocks}
                rentalReservations={serializedReservations}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
