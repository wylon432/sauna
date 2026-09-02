'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatCurrency, formatDate, EXPENSE_CATEGORIES, PAYMENT_METHODS } from '@/lib/utils';
import {
  Loader2, Plus, FileText, Edit2, Trash2, X, AlertCircle, Search,
} from 'lucide-react';

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  notes: string | null;
  user: { id: string; name: string };
}

interface FormData {
  description: string;
  category: string;
  amount: string;
  date: string;
  paymentMethod: string;
  notes: string;
}

const emptyForm: FormData = {
  description: '',
  category: EXPENSE_CATEGORIES[0],
  amount: '',
  date: new Date().toISOString().split('T')[0],
  paymentMethod: 'DINHEIRO',
  notes: '',
};

export default function DespesasPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      let url = '/api/expenses';
      const params: string[] = [];
      if (startDate) params.push(`startDate=${startDate}`);
      if (endDate) params.push(`endDate=${endDate}`);
      if (params.length) url += `?${params.join('&')}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro ao carregar despesas');
      const data = await res.json();
      setExpenses(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const filtered = expenses.filter((e) => {
    const matchSearch = !search ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !categoryFilter || e.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setForm({
      description: expense.description,
      category: expense.category,
      amount: (expense.amount / 100).toFixed(2).replace('.', ','),
      date: expense.date.split('T')[0],
      paymentMethod: expense.paymentMethod,
      notes: expense.notes || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.description.trim()) errs.description = 'Descrição é obrigatória';
    if (!form.category) errs.category = 'Categoria é obrigatória';
    const amountVal = parseFloat(form.amount.replace(',', '.'));
    if (!form.amount || isNaN(amountVal) || amountVal <= 0) errs.amount = 'Valor deve ser maior que zero';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setError('');
    try {
      const amountCents = Math.round(parseFloat(form.amount.replace(',', '.')) * 100);
      const body = {
        description: form.description.trim(),
        category: form.category,
        amount: amountCents,
        date: form.date || undefined,
        paymentMethod: form.paymentMethod,
        notes: form.notes.trim() || null,
      };

      const url = editingId ? `/api/expenses/${editingId}` : '/api/expenses';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar');
      }
      setShowModal(false);
      fetchExpenses();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, description: string) => {
    if (!window.confirm(`Excluir despesa "${description}"?`)) return;
    try {
      const res = await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao excluir');
      }
      fetchExpenses();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Despesas</h1>
          <p className="text-sm text-dark-400">{filtered.length} despesa(s) · Total: {formatCurrency(totalFiltered)}</p>
        </div>
        <button onClick={openCreate} className="btn-gold">
          <Plus className="h-4 w-4" /> Nova Despesa
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-600/30 bg-red-600/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-500" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select w-auto min-w-[150px]">
          <option value="">Todas categorias</option>
          {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input w-auto" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input w-auto" />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center py-12">
          <FileText className="mb-3 h-10 w-10 text-dark-600" />
          <p className="text-sm text-dark-500">Nenhuma despesa encontrada</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dark-800 text-dark-400">
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Categoria</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Pagamento</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium text-right">Valor</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id} className="table-row">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{e.description}</p>
                    <p className="text-xs text-dark-500 sm:hidden">{e.category}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="badge-gold">{e.category}</span>
                  </td>
                  <td className="px-4 py-3 text-dark-300 hidden md:table-cell">{e.paymentMethod}</td>
                  <td className="px-4 py-3 text-dark-400">{formatDate(e.date)}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-400">{formatCurrency(e.amount)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(e)} className="rounded p-1.5 text-dark-400 hover:text-gold-400 hover:bg-dark-800">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(e.id, e.description)} className="rounded p-1.5 text-dark-400 hover:text-red-400 hover:bg-dark-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-xl bg-dark-900 border border-dark-800 sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-dark-800 p-4">
              <h3 className="text-sm font-semibold text-white">{editingId ? 'Editar Despesa' : 'Nova Despesa'}</h3>
              <button onClick={() => setShowModal(false)} className="rounded p-1 text-dark-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="label">Descrição *</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`input ${formErrors.description ? 'border-red-600' : ''}`}
                  autoFocus
                />
                {formErrors.description && <p className="mt-1 text-xs text-red-400">{formErrors.description}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Categoria *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className={`select ${formErrors.category ? 'border-red-600' : ''}`}
                  >
                    {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {formErrors.category && <p className="mt-1 text-xs text-red-400">{formErrors.category}</p>}
                </div>
                <div>
                  <label className="label">Valor (R$) *</label>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className={`input ${formErrors.amount ? 'border-red-600' : ''}`}
                  />
                  {formErrors.amount && <p className="mt-1 text-xs text-red-400">{formErrors.amount}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Data</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Forma de Pagamento</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="select"
                  >
                    {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Observações</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="input"
                  rows={2}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="btn-outline flex-1">Cancelar</button>
                <button onClick={handleSubmit} disabled={saving} className="btn-gold flex-1">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
