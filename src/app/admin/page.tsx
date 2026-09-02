'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatDateTime, timeAgo } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  DollarSign, ShoppingCart, Users, AlertTriangle, Loader2, TrendingUp, Package,
} from 'lucide-react';

interface DashboardData {
  today: { revenue: number; orders: number };
  totals: { customers: number; products: number };
  lowStockAlerts: { id: string; name: string; stock: number; minStock: number; unit: string }[];
  recentOrders: any[];
  chartData: { day: string; revenue: number; orders: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  ABERTA: 'badge-blue',
  PENDENTE: 'badge-yellow',
  PAGA: 'badge-green',
  FECHADA: 'badge-green',
  CANCELADA: 'badge-red',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => {
        if (!r.ok) throw new Error('Erro ao carregar dados');
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-600/30 bg-red-600/10 p-4 text-sm text-red-400">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: 'Receita Hoje',
      value: formatCurrency(data.today.revenue),
      icon: DollarSign,
      color: 'text-gold-500',
      bg: 'bg-gold-600/10',
    },
    {
      label: 'Pedidos Hoje',
      value: data.today.orders.toString(),
      icon: ShoppingCart,
      color: 'text-blue-400',
      bg: 'bg-blue-600/10',
    },
    {
      label: 'Total Clientes',
      value: data.totals.customers.toString(),
      icon: Users,
      color: 'text-green-400',
      bg: 'bg-green-600/10',
    },
    {
      label: 'Estoque Baixo',
      value: data.lowStockAlerts.length.toString(),
      icon: AlertTriangle,
      color: data.lowStockAlerts.length > 0 ? 'text-red-400' : 'text-green-400',
      bg: data.lowStockAlerts.length > 0 ? 'bg-red-600/10' : 'bg-green-600/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-dark-400">Visão geral do sistema</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-dark-400">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {data.lowStockAlerts.length > 0 && (
        <div className="card border-yellow-600/20 bg-yellow-600/5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-yellow-400">Alertas de Estoque Baixo</h3>
          </div>
          <div className="space-y-2">
            {data.lowStockAlerts.map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-dark-200">{p.name}</span>
                <span className="text-yellow-400">
                  {p.stock} / {p.minStock} {p.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gold-500" />
          <h2 className="text-sm font-semibold text-white">Receita - Últimos 7 Dias</h2>
        </div>
        {data.chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="day" tick={{ fill: '#999', fontSize: 12 }} axisLine={{ stroke: '#262626' }} />
                <YAxis tick={{ fill: '#999', fontSize: 12 }} axisLine={{ stroke: '#262626' }} tickFormatter={(v) => `${(v / 100).toFixed(0)}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: number) => [formatCurrency(value), 'Receita']}
                />
                <Bar dataKey="revenue" fill="#b8922e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-dark-500">Sem dados para exibir</p>
        )}
      </div>

      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-gold-500" />
          <h2 className="text-sm font-semibold text-white">Últimos Pedidos</h2>
        </div>
        {data.recentOrders.length === 0 ? (
          <div className="py-8 text-center">
            <Package className="mx-auto mb-2 h-8 w-8 text-dark-600" />
            <p className="text-sm text-dark-500">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-dark-800 text-dark-400">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Cliente</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Total</th>
                  <th className="pb-3 font-medium">Criada</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order: any) => (
                  <tr key={order.id} className="table-row">
                    <td className="py-3 font-medium text-white">#{order.orderNumber}</td>
                    <td className="py-3 text-dark-300">{order.customer?.name || '—'}</td>
                    <td className="py-3">
                      <span className={STATUS_COLORS[order.status] || 'badge-gray'}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium text-gold-400">{formatCurrency(order.total)}</td>
                    <td className="py-3 text-dark-400">{timeAgo(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
