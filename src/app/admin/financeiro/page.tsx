'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Save,
  X,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { formatCurrency, formatDate } from '@/lib/utils';

interface FinancialData {
  totalReceived: number;
  totalPending: number;
  totalExpenses: number;
  operatingBalance: number;
  revenueByCategory: { category: string; total: number }[];
  monthlyRevenue: { month: string; receita: number; despesas: number }[];
  recentPayments: any[];
  recentExpenses: any[];
}

export default function FinanceiroPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ description: '', category: 'OPERACIONAL', amount: 0 });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchData = () => {
    fetch('/api/admin/financial')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddExpense = async () => {
    await fetch('/api/admin/financial/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseForm),
    });
    setShowExpenseForm(false);
    setExpenseForm({ description: '', category: 'OPERACIONAL', amount: 0 });
    fetchData();
  };

  const COLORS = ['#dd5a16', '#0082da', '#9333ea', '#059669', '#dc2626'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-sauna-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <button onClick={() => setShowExpenseForm(true)} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" /> Nova Despesa
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="admin-card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-700">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Recebido</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(data?.totalReceived ?? 0)}</p>
          </div>
        </div>
        <div className="admin-card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 text-yellow-700">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Pendente</p>
            <p className="text-2xl font-bold text-yellow-700">{formatCurrency(data?.totalPending ?? 0)}</p>
          </div>
        </div>
        <div className="admin-card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-700">
            <TrendingDown className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Despesas</p>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(data?.totalExpenses ?? 0)}</p>
          </div>
        </div>
        <div className="admin-card flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Saldo Operacional</p>
            <p className="text-2xl font-bold text-blue-700">{formatCurrency(data?.operatingBalance ?? 0)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="admin-card">
          <h2 className="mb-4 text-lg font-semibold">Receita Mensal</h2>
          {data?.monthlyRevenue?.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="receita" fill="#dd5a16" name="Receita" radius={[4, 4, 0, 0]} />
                <Bar dataKey="despesas" fill="#dc2626" name="Despesas" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500">Sem dados.</p>
          )}
        </div>

        <div className="admin-card">
          <h2 className="mb-4 text-lg font-semibold">Receita por Categoria</h2>
          {data?.revenueByCategory?.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={data.revenueByCategory} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={100} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}>
                  {data.revenueByCategory.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500">Sem dados.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="admin-card">
          <h2 className="mb-4 text-lg font-semibold">Pagamentos Recentes</h2>
          <div className="space-y-2">
            {data?.recentPayments?.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between rounded border p-3 text-sm">
                <div>
                  <p className="font-medium">{p.user?.name || 'Cliente'}</p>
                  <p className="text-xs text-gray-500">{p.description || p.type} - {p.method}</p>
                </div>
                <span className="font-semibold text-green-600">{formatCurrency(p.amount)}</span>
              </div>
            ))}
            {(!data?.recentPayments || data.recentPayments.length === 0) && (
              <p className="text-sm text-gray-500">Nenhum pagamento recente.</p>
            )}
          </div>
        </div>

        <div className="admin-card">
          <h2 className="mb-4 text-lg font-semibold">Despesas Recentes</h2>
          <div className="space-y-2">
            {data?.recentExpenses?.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between rounded border p-3 text-sm">
                <div>
                  <p className="font-medium">{e.description}</p>
                  <p className="text-xs text-gray-500">{e.category} - {formatDate(e.date)}</p>
                </div>
                <span className="font-semibold text-red-600">{formatCurrency(e.amount)}</span>
              </div>
            ))}
            {(!data?.recentExpenses || data.recentExpenses.length === 0) && (
              <p className="text-sm text-gray-500">Nenhuma despesa registrada.</p>
            )}
          </div>
        </div>
      </div>

      {showExpenseForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Nova Despesa</h3>
              <button onClick={() => setShowExpenseForm(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Descrição</label>
                <input className="input" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
              </div>
              <div>
                <label className="label">Categoria</label>
                <select className="input" value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}>
                  <option value="OPERACIONAL">Operacional</option>
                  <option value="MANUTENCAO">Manutenção</option>
                  <option value="ENERGIA">Energia</option>
                  <option value="AGUA">Água</option>
                  <option value="SALARIO">Salário</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>
              <div>
                <label className="label">Valor (R$)</label>
                <input className="input" type="number" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })} />
              </div>
              <button onClick={handleAddExpense} className="btn-primary w-full"><Save className="mr-2 h-4 w-4" /> Registrar Despesa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
