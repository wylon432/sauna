'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  Loader2, DollarSign, TrendingUp, TrendingDown, ShoppingCart, Package,
  BarChart3, PieChart as PieChartIcon, AlertCircle, X,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

interface FinancialData {
  period: string;
  start: string;
  end: string;
  totalRevenue: number;
  totalCosts: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  orderCount: number;
  expenseCount: number;
}

interface OrderPayment {
  id: string;
  orderNumber: number;
  total: number;
  status: string;
  closedAt: string | null;
  customer: { name: string } | null;
  payments: { method: string; amount: number }[];
}

interface ExpenseItem {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
}

type Period = 'today' | 'week' | 'month' | 'year' | 'custom';

const PERIOD_LABELS: Record<Period, string> = {
  today: 'Hoje',
  week: 'Semana',
  month: 'Mês',
  year: 'Ano',
  custom: 'Personalizado',
};

const PIE_COLORS = ['#d4a843', '#f9d062', '#b8922e', '#9a7a24', '#7d621d', '#5c4815', '#3d2f0e', '#262626', '#333333', '#444444'];

const expenseCategories = (expenses: ExpenseItem[]) => {
  const map: Record<string, number> = {};
  expenses.forEach((e) => { map[e.category] = (map[e.category] || 0) + e.amount; });
  return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};

const revenueByDay = (data: FinancialData) => {
  const start = new Date(data.start);
  const end = new Date(data.end);
  const days: { day: string; value: number }[] = [];
  const current = new Date(start);
  while (current <= end) {
    days.push({ day: formatDate(current), value: 0 });
    current.setDate(current.getDate() + 1);
  }
  return days;
};

export default function FinanceiroPage() {
  const [period, setPeriod] = useState<Period>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState<FinancialData | null>(null);
  const [orders, setOrders] = useState<OrderPayment[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      let url = `/api/financial?period=${period}`;
      if (period === 'custom') {
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
      }

        const [finRes, ordRes, expRes] = await Promise.all([
        fetch(url),
        fetch('/api/orders'),
        fetch('/api/expenses'),
      ]);

      if (!finRes.ok) throw new Error('Erro ao carregar dados financeiros');

      const finData = await finRes.json();
      setData(finData);

      if (ordRes.ok) {
        const ordData = await ordRes.json();
        const startD = new Date(finData.start);
        const endD = new Date(finData.end);
        endD.setHours(23, 59, 59, 999);
        const filtered = ordData.filter((o: OrderPayment) => {
          if (!o.closedAt) return false;
          const d = new Date(o.closedAt);
          return d >= startD && d <= endD;
        });
        setOrders(filtered);
      }

      if (expRes.ok) {
        const expData = await expRes.json();
        setExpenses(expData);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [period]);

  const margin = data && data.totalRevenue > 0 ? ((data.netProfit / data.totalRevenue) * 100) : 0;

  const pieData = expenses.length > 0 ? expenseCategories(expenses) : [];

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Financeiro</h1>
          <p className="text-sm text-dark-400">Análise financeira do período</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-600/30 bg-red-600/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              period === p ? 'bg-gold-600 text-dark-950' : 'bg-dark-800 text-dark-300 hover:text-white'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
        {period === 'custom' && (
          <div className="flex items-center gap-2 ml-2">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input w-auto text-xs" />
            <span className="text-dark-500 text-xs">até</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input w-auto text-xs" />
            <button onClick={fetchData} className="btn-gold-sm">Filtrar</button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-dark-400">Receitas</p>
                  <p className="mt-1 text-2xl font-bold text-green-400">{formatCurrency(data.totalRevenue)}</p>
                  <p className="text-xs text-dark-500">{data.orderCount} pedido(s)</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600/10">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-dark-400">Custo dos Produtos</p>
                  <p className="mt-1 text-2xl font-bold text-red-400">{formatCurrency(data.totalCosts)}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600/10">
                  <Package className="h-5 w-5 text-red-400" />
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-dark-400">Despesas</p>
                  <p className="mt-1 text-2xl font-bold text-red-400">{formatCurrency(data.totalExpenses)}</p>
                  <p className="text-xs text-dark-500">{data.expenseCount} despesa(s)</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600/10">
                  <DollarSign className="h-5 w-5 text-red-400" />
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-dark-400">Lucro Bruto</p>
                  <p className={`mt-1 text-2xl font-bold ${data.grossProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(data.grossProfit)}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-600/10">
                  <TrendingUp className="h-5 w-5 text-gold-500" />
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-dark-400">Lucro Líquido</p>
                  <p className={`mt-1 text-2xl font-bold ${data.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(data.netProfit)}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-600/10">
                  <DollarSign className="h-5 w-5 text-gold-500" />
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-dark-400">Margem %</p>
                  <p className={`mt-1 text-2xl font-bold ${margin >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {margin.toFixed(1)}%
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/10">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="card">
              <div className="mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-gold-500" />
                <h3 className="text-sm font-semibold text-white">Receitas - Período</h3>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueByDay(data)} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                    <XAxis dataKey="day" tick={{ fill: '#999', fontSize: 10 }} axisLine={{ stroke: '#262626' }} />
                    <YAxis tick={{ fill: '#999', fontSize: 12 }} axisLine={{ stroke: '#262626' }} tickFormatter={(v) => `${(v / 100).toFixed(0)}`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px' }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value: number) => [formatCurrency(value), 'Receita']}
                    />
                    <Bar dataKey="value" fill="#b8922e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="mb-4 flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-gold-500" />
                <h3 className="text-sm font-semibold text-white">Despesas por Categoria</h3>
              </div>
              {pieData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#141414', border: '1px solid #262626', borderRadius: '8px' }}
                        formatter={(value: number) => [formatCurrency(value), 'Valor']}
                      />
                      <Legend wrapperStyle={{ color: '#999', fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center">
                  <p className="text-sm text-dark-500">Sem despesas no período</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="mb-4 flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-gold-500" />
              <h3 className="text-sm font-semibold text-white">Últimos Pagamentos</h3>
            </div>
            {orders.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-dark-600" />
                <p className="text-sm text-dark-500">Nenhum pagamento no período</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-dark-800 text-dark-400">
                      <th className="pb-3 font-medium">#</th>
                      <th className="pb-3 font-medium">Cliente</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Pagamentos</th>
                      <th className="pb-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 20).map((o) => (
                      <tr key={o.id} className="table-row">
                        <td className="py-3 font-medium text-white">#{o.orderNumber}</td>
                        <td className="py-3 text-dark-300">{o.customer?.name || '—'}</td>
                        <td className="py-3">
                          <span className={o.status === 'FECHADA' ? 'badge-green' : 'badge-gold'}>{o.status}</span>
                        </td>
                        <td className="py-3 text-dark-400">
                          {o.payments.map((p) => p.method).join(', ') || '—'}
                        </td>
                        <td className="py-3 text-right font-medium text-gold-400">{formatCurrency(o.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
