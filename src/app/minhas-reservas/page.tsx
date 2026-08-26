'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Flame,
  Loader2,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Package,
  CreditCard,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime, RESERVATION_STATUS, SAUNA_STATUS } from '@/lib/utils';

interface RentalReservationData {
  id: string;
  date: string;
  endDate: string | null;
  status: string;
  totalValue: number;
  notes: string | null;
  createdAt: string;
  package: {
    name: string;
    description: string;
    days: number;
  };
  payments: {
    id: string;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
  }[];
  statusHistory: {
    id: string;
    oldStatus: string | null;
    newStatus: string;
    reason: string | null;
    createdAt: string;
  }[];
}

interface SaunaReservationData {
  id: string;
  date: string;
  status: string;
  notes: string | null;
  createdAt: string;
  schedule: {
    dayName: string;
    gender: string;
    startTime: string;
    endTime: string;
  };
  payments: {
    id: string;
    amount: number;
    method: string;
    status: string;
    createdAt: string;
  }[];
}

const STATUS_PILL: Record<string, string> = {
  PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-blue-100 text-blue-700 border-blue-200',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-100 text-red-700 border-red-200',
  RECEIVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const PAYMENT_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  RECEIVED: 'Pago',
  CANCELLED: 'Cancelado',
};

export default function MinhasReservasPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'aluguel' | 'sauna'>('aluguel');
  const [rentalReservations, setRentalReservations] = useState<RentalReservationData[]>([]);
  const [saunaReservations, setSaunaReservations] = useState<SaunaReservationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (authStatus === 'authenticated' && (session?.user as any)?.id) {
      fetchReservations((session.user as any).id);
    }
  }, [authStatus, session, router]);

  async function fetchReservations(userId: string) {
    try {
      const [rentalRes, saunaRes] = await Promise.all([
        fetch(`/api/users/${userId}/rental-reservations`).catch(() => ({ ok: false, json: () => [] })),
        fetch(`/api/users/${userId}/sauna-reservations`).catch(() => ({ ok: false, json: () => [] })),
      ]);

      if (rentalRes.ok) {
        const rentalData = await rentalRes.json();
        setRentalReservations(Array.isArray(rentalData) ? rentalData : []);
      }

      if (saunaRes.ok) {
        const saunaData = await saunaRes.json();
        setSaunaReservations(Array.isArray(saunaData) ? saunaData : []);
      }
    } catch {
      setError('Erro ao carregar reservas');
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  function getTotalPaid(payments: { amount: number; status: string }[]) {
    return payments
      .filter((p) => p.status === 'RECEIVED' || p.status === 'CONFIRMED')
      .reduce((acc, p) => acc + p.amount, 0);
  }

  function StatusBadge({ status }: { status: string }) {
    const label = RESERVATION_STATUS[status]?.label || SAUNA_STATUS[status]?.label || status;
    const pillClass = STATUS_PILL[status] || 'bg-slate-100 text-slate-700 border-slate-200';
    return (
      <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${pillClass}`}>
        {label}
      </span>
    );
  }

  if (loading || authStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/minha-conta" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Minha Conta
        </Link>

        <div className="mb-8 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
              <Calendar className="h-7 w-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Minhas Reservas</h1>
              <p className="mt-1 text-sm text-slate-300">Acompanhe suas reservas de aluguel e sauna</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
              <X className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-sm font-medium text-red-700">{error}</p>
            <button onClick={() => setError('')} className="ml-auto shrink-0 text-red-400 hover:text-red-600">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/50">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('aluguel')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all ${
                activeTab === 'aluguel'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Package className="h-4 w-4" />
              Aluguel
              <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === 'aluguel' ? 'bg-white/20' : 'bg-slate-100'}`}>
                {rentalReservations.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('sauna')}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all ${
                activeTab === 'sauna'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Flame className="h-4 w-4" />
              Sauna
              <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === 'sauna' ? 'bg-white/20' : 'bg-slate-100'}`}>
                {saunaReservations.length}
              </span>
            </button>
          </div>
        </div>

        {activeTab === 'aluguel' && (
          <div className="space-y-4">
            {rentalReservations.length === 0 ? (
              <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-lg shadow-slate-200/50">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                  <Package className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Nenhuma reserva de aluguel</h3>
                <p className="mt-2 text-sm text-slate-500">Você ainda não fez nenhuma reserva de aluguel.</p>
                <Link
                  href="/aluguel"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-700"
                >
                  <Package className="h-4 w-4" />
                  Fazer uma reserva
                </Link>
              </div>
            ) : (
              rentalReservations.map((res) => {
                const totalPaid = getTotalPaid(res.payments);
                const isExpanded = expandedId === res.id;
                const pending = res.totalValue - totalPaid;

                return (
                  <div key={res.id} className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/50 transition-all hover:shadow-xl">
                    <div
                      className="flex cursor-pointer items-center gap-4 p-6"
                      onClick={() => toggleExpand(res.id)}
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
                        <Package className="h-7 w-7 text-amber-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="font-bold text-slate-900">{res.package?.name}</h3>
                          <StatusBadge status={res.status} />
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(res.date)}
                            {res.endDate && ` — ${formatDate(res.endDate)}`}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            {res.package?.days} dia(s)
                          </span>
                          <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                            <DollarSign className="h-3.5 w-3.5" />
                            {formatCurrency(res.totalValue)}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-100 px-6 pb-6 pt-5">
                        {res.package?.description && (
                          <p className="mb-5 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                            {res.package.description}
                          </p>
                        )}

                        {res.payments.length > 0 && (
                          <div className="mb-5">
                            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                              <CreditCard className="h-4 w-4" />
                              Pagamentos
                            </h4>
                            <div className="space-y-2">
                              {res.payments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                                  <div>
                                    <p className="font-semibold text-slate-900">{formatCurrency(payment.amount)}</p>
                                    <p className="mt-0.5 text-xs text-slate-500">{payment.method} — {formatDateTime(payment.createdAt)}</p>
                                  </div>
                                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_PILL[payment.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                    {PAYMENT_LABELS[payment.status] || payment.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-3 rounded-xl bg-slate-50 p-4">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500">Total pago:</span>
                                <span className="font-bold text-slate-900">{formatCurrency(totalPaid)}</span>
                              </div>
                              {pending > 0 && (
                                <div className="mt-1 flex items-center justify-between text-sm">
                                  <span className="text-slate-500">Pendente:</span>
                                  <span className="font-bold text-red-600">{formatCurrency(pending)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {res.statusHistory && res.statusHistory.length > 0 && (
                          <div>
                            <h4 className="mb-3 text-sm font-bold text-slate-700">Histórico</h4>
                            <div className="relative ml-2 border-l-2 border-slate-200 pl-6">
                              {res.statusHistory
                                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                .map((h, i) => {
                                  const statusLabel = RESERVATION_STATUS[h.newStatus]?.label || h.newStatus;
                                  return (
                                    <div key={h.id} className="relative pb-6 last:pb-0">
                                      <div className={`absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white ${i === 0 ? 'bg-amber-500' : 'bg-slate-300'}`} />
                                      <p className="text-sm font-semibold text-slate-900">{statusLabel}</p>
                                      <p className="text-xs text-slate-500">{formatDateTime(h.createdAt)}</p>
                                      {h.reason && (
                                        <p className="mt-1 text-xs italic text-slate-400">{h.reason}</p>
                                      )}
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        )}

                        {res.notes && (
                          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-4">
                            <p className="mb-1 text-xs font-semibold text-amber-700">Observações</p>
                            <p className="text-sm text-amber-800">{res.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'sauna' && (
          <div className="space-y-4">
            {saunaReservations.length === 0 ? (
              <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-lg shadow-slate-200/50">
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                  <Flame className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Nenhuma reserva de sauna</h3>
                <p className="mt-2 text-sm text-slate-500">Você ainda não fez nenhuma reserva de sauna.</p>
                <Link
                  href="/sauna"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-700"
                >
                  <Flame className="h-4 w-4" />
                  Fazer uma reserva
                </Link>
              </div>
            ) : (
              saunaReservations.map((res) => {
                const isExpanded = expandedId === res.id;

                return (
                  <div key={res.id} className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/50 transition-all hover:shadow-xl">
                    <div
                      className="flex cursor-pointer items-center gap-4 p-6"
                      onClick={() => toggleExpand(res.id)}
                    >
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-50">
                        <Flame className="h-7 w-7 text-orange-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="font-bold text-slate-900">Sauna</h3>
                          <StatusBadge status={res.status} />
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(res.date)}
                          </span>
                          <span>{res.schedule?.dayName} • {res.schedule?.startTime} - {res.schedule?.endTime}</span>
                          <span className="capitalize">{res.schedule?.gender?.toLowerCase()}</span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-slate-100 px-6 pb-6 pt-5">
                        {res.payments && res.payments.length > 0 && (
                          <div className="mb-5">
                            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                              <CreditCard className="h-4 w-4" />
                              Pagamentos
                            </h4>
                            <div className="space-y-2">
                              {res.payments.map((payment) => (
                                <div key={payment.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                                  <div>
                                    <p className="font-semibold text-slate-900">{formatCurrency(payment.amount)}</p>
                                    <p className="mt-0.5 text-xs text-slate-500">{payment.method} — {formatDateTime(payment.createdAt)}</p>
                                  </div>
                                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${STATUS_PILL[payment.status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                                    {PAYMENT_LABELS[payment.status] || payment.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {res.notes && (
                          <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                            <p className="mb-1 text-xs font-semibold text-amber-700">Observações</p>
                            <p className="text-sm text-amber-800">{res.notes}</p>
                          </div>
                        )}

                        <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          Criada em: {formatDateTime(res.createdAt)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
