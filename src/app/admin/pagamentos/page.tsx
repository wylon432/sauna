'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Loader2,
  Plus,
  Save,
  CreditCard,
  X,
  Filter,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PaymentData {
  id: string;
  type: string;
  method: string;
  amount: number;
  description?: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
  rentalReservation?: { id: string; date: string } | null;
  saunaReservation?: { id: string; date: string } | null;
}

const TYPE_LABELS: Record<string, string> = { RENTAL: 'Aluguel', SAUNA: 'Sauna', BEVERAGE: 'Bebida' };
const METHOD_LABELS: Record<string, string> = { PIX: 'PIX', CASH: 'Dinheiro', CARD: 'Cartão' };
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  RECEIVED: { label: 'Recebido', color: 'bg-green-100 text-green-800' },
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export default function PagamentosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'RENTAL', method: 'PIX', amount: 0, description: '', userId: '' });
  const [filterType, setFilterType] = useState('ALL');
  const [filterMethod, setFilterMethod] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchPayments = () => {
    fetch('/api/admin/payments')
      .then((r) => r.json())
      .then((d) => setPayments(d.payments || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);

  const handleCreate = async () => {
    await fetch('/api/admin/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ type: 'RENTAL', method: 'PIX', amount: 0, description: '', userId: '' });
    fetchPayments();
  };

  const filtered = payments.filter((p) => {
    if (filterType !== 'ALL' && p.type !== filterType) return false;
    if (filterMethod !== 'ALL' && p.method !== filterMethod) return false;
    if (filterStatus !== 'ALL' && p.status !== filterStatus) return false;
    return true;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Pagamentos</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <CreditCard className="mr-2 h-4 w-4" /> Novo Pagamento
        </button>
      </div>

      <div className="admin-card">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="label text-xs">Tipo</label>
            <select className="input py-2 text-sm" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="ALL">Todos</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Método</label>
            <select className="input py-2 text-sm" value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}>
              <option value="ALL">Todos</option>
              {Object.entries(METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="label text-xs">Status</label>
            <select className="input py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="ALL">Todos</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="admin-card space-y-4">
          <h3 className="font-semibold">Registrar Pagamento</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Método</label>
              <select className="input" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                {Object.entries(METHOD_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Valor (R$)</label>
              <input className="input" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Descrição</label>
              <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="btn-primary"><Save className="mr-2 h-4 w-4" /> Registrar</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      <div className="admin-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="table-header">Data</th>
              <th className="table-header">Cliente</th>
              <th className="table-header">Tipo</th>
              <th className="table-header">Método</th>
              <th className="table-header">Valor</th>
              <th className="table-header">Status</th>
              <th className="table-header">Descrição</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="table-cell">{formatDate(p.createdAt)}</td>
                <td className="table-cell font-medium">{p.user?.name}</td>
                <td className="table-cell">{TYPE_LABELS[p.type] || p.type}</td>
                <td className="table-cell">{METHOD_LABELS[p.method] || p.method}</td>
                <td className="table-cell font-semibold text-green-700">{formatCurrency(p.amount)}</td>
                <td className="table-cell">
                  <span className={`badge ${STATUS_LABELS[p.status]?.color || 'bg-gray-100'}`}>
                    {STATUS_LABELS[p.status]?.label || p.status}
                  </span>
                </td>
                <td className="table-cell text-gray-500">{p.description || '-'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="table-cell text-center text-gray-500">Nenhum pagamento encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
