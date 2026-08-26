'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  DollarSign,
  Wine,
  Clock,
  Plus,
  CreditCard,
  GlassWater,
  Newspaper,
  Megaphone,
  ImagePlus,
  Loader2,
  TrendingUp,
  AlertTriangle,
  Star,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency, formatDate } from '@/lib/utils';

interface DashboardData {
  todayReservations: number;
  todayPayments: number;
  todayConsumption: number;
  pendingItems: number;
  upcomingReservations: any[];
  pendingPayments: any[];
  alerts: {
    expiringPreReservations: number;
    lowStock: any[];
    pendingReviews: number;
  };
  monthlyData: { month: string; reservas: number; receita: number }[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-sauna-600" />
      </div>
    );
  }

  const stats = [
    {
      label: 'Reservas Hoje',
      value: data?.todayReservations ?? 0,
      icon: CalendarDays,
      color: 'bg-sauna-100 text-sauna-700',
    },
    {
      label: 'Pagamentos Hoje',
      value: formatCurrency(data?.todayPayments ?? 0),
      icon: DollarSign,
      color: 'bg-green-100 text-green-700',
    },
    {
      label: 'Consumo Hoje',
      value: formatCurrency(data?.todayConsumption ?? 0),
      icon: Wine,
      color: 'bg-pool-100 text-pool-700',
    },
    {
      label: 'Itens Pendentes',
      value: data?.pendingItems ?? 0,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-700',
    },
  ];

  const quickActions = [
    { label: '+ Nova Reserva', href: '/admin/aluguel?new=1', icon: Plus, color: 'bg-sauna-600 hover:bg-sauna-700' },
    { label: 'Registrar Pagamento', href: '/admin/pagamentos?new=1', icon: CreditCard, color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Registrar Consumo', href: '/admin/bebidas?consume=1', icon: GlassWater, color: 'bg-pool-600 hover:bg-pool-700' },
    { label: 'Publicar Notícia', href: '/admin/noticias?new=1', icon: Newspaper, color: 'bg-party-600 hover:bg-party-700' },
    { label: 'Publicar Aviso', href: '/admin/avisos?new=1', icon: Megaphone, color: 'bg-yellow-600 hover:bg-yellow-700' },
    { label: 'Adicionar Foto', href: '/admin/galeria?new=1', icon: ImagePlus, color: 'bg-gray-600 hover:bg-gray-700' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="admin-card flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-sm transition-all ${action.color}`}
            >
              <Icon className="h-5 w-5" />
              {action.label}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="admin-card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Reservas Próximas (7 dias)</h2>
          {data?.upcomingReservations?.length ? (
            <div className="space-y-3">
              {data.upcomingReservations.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{r.user?.name || 'Cliente'}</p>
                    <p className="text-xs text-gray-500">{formatDate(r.date)} - {r.package?.name || 'Sauna'}</p>
                  </div>
                  <span className={`badge ${r.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhuma reserva nos próximos 7 dias.</p>
          )}
        </div>

        <div className="admin-card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Pagamentos Pendentes</h2>
          {data?.pendingPayments?.length ? (
            <div className="space-y-3">
              {data.pendingPayments.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="text-sm font-medium">{p.user?.name || 'Cliente'}</p>
                    <p className="text-xs text-gray-500">{p.description || p.type}</p>
                  </div>
                  <span className="text-sm font-semibold text-red-600">{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Nenhum pagamento pendente.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="admin-card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Alertas</h2>
          <div className="space-y-3">
            {data?.alerts?.expiringPreReservations ? (
              <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  {data.alerts.expiringPreReservations} pré-reserva(s) expirando
                </p>
              </div>
            ) : null}
            {data?.alerts?.lowStock?.length ? (
              data.alerts.lowStock.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-800">
                    Estoque baixo: {item.name} ({item.currentStock} {item.unit})
                  </p>
                </div>
              ))
            ) : null}
            {data?.alerts?.pendingReviews ? (
              <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
                <Star className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-800">
                  {data.alerts.pendingReviews} avaliação(ões) pendente(s)
                </p>
              </div>
            ) : null}
            {!data?.alerts?.expiringPreReservations && !data?.alerts?.lowStock?.length && !data?.alerts?.pendingReviews && (
              <p className="text-sm text-gray-500">Nenhum alerta no momento.</p>
            )}
          </div>
        </div>

        <div className="admin-card">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Receita Mensal</h2>
          {data?.monthlyData?.length ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="receita" fill="#dd5a16" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500">Sem dados de receita.</p>
          )}
        </div>
      </div>
    </div>
  );
}
