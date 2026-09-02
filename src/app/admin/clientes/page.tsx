'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Loader2, Plus, Search, Users, Edit2, Trash2, X, AlertCircle, Phone, Mail, MapPin,
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  cpf: string | null;
  address: string | null;
  notes: string | null;
  active: boolean;
  _count?: { orders: number };
}

interface FormData {
  name: string;
  phone: string;
  email: string;
  cpf: string;
  address: string;
  notes: string;
}

const emptyForm: FormData = { name: '', phone: '', email: '', cpf: '', address: '', notes: '' };

export default function ClientesPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [searchDebounce, setSearchDebounce] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchCustomers = useCallback(async () => {
    try {
      const url = searchDebounce ? `/api/customers?search=${encodeURIComponent(searchDebounce)}` : '/api/customers';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro ao carregar clientes');
      const data = await res.json();
      setCustomers(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [searchDebounce]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounce(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (c: Customer) => {
    setEditingId(c.id);
    setForm({
      name: c.name,
      phone: c.phone || '',
      email: c.email || '',
      cpf: c.cpf || '',
      address: c.address || '',
      notes: c.notes || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Nome é obrigatório';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        cpf: form.cpf.trim() || null,
        address: form.address.trim() || null,
        notes: form.notes.trim() || null,
      };

      const url = editingId ? `/api/customers/${editingId}` : '/api/customers';
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
      fetchCustomers();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Desativar cliente "${name}"?`)) return;
    try {
      const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao remover');
      }
      fetchCustomers();
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Clientes</h1>
          <p className="text-sm text-dark-400">{customers.length} cliente(s)</p>
        </div>
        <button onClick={openCreate} className="btn-gold">
          <Plus className="h-4 w-4" /> Novo Cliente
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-600/30 bg-red-600/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-500" />
        <input
          type="text"
          placeholder="Buscar por nome, telefone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
        />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
        </div>
      ) : customers.length === 0 ? (
        <div className="card flex flex-col items-center py-12">
          <Users className="mb-3 h-10 w-10 text-dark-600" />
          <p className="text-sm text-dark-500">Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dark-800 text-dark-400">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Telefone</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Email</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">CPF</th>
                <th className="px-4 py-3 font-medium text-center">Pedidos</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="table-row">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{c.name}</p>
                    <p className="text-xs text-dark-500 sm:hidden">{c.phone || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-dark-300 hidden sm:table-cell">{c.phone || '—'}</td>
                  <td className="px-4 py-3 text-dark-300 hidden md:table-cell">{c.email || '—'}</td>
                  <td className="px-4 py-3 text-dark-300 hidden lg:table-cell">{c.cpf || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="badge-gold">{c._count?.orders ?? 0}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="rounded p-1.5 text-dark-400 hover:text-gold-400 hover:bg-dark-800">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(c.id, c.name)} className="rounded p-1.5 text-dark-400 hover:text-red-400 hover:bg-dark-800">
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
              <h3 className="text-sm font-semibold text-white">{editingId ? 'Editar Cliente' : 'Novo Cliente'}</h3>
              <button onClick={() => setShowModal(false)} className="rounded p-1 text-dark-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="label">Nome *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`input ${formErrors.name ? 'border-red-600' : ''}`}
                  autoFocus
                />
                {formErrors.name && <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="label">Telefone</label>
                  <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="(00) 00000-0000" />
                </div>
                <div>
                  <label className="label">CPF</label>
                  <input type="text" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} className="input" placeholder="000.000.000-00" />
                </div>
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`input ${formErrors.email ? 'border-red-600' : ''}`}
                  placeholder="email@exemplo.com"
                />
                {formErrors.email && <p className="mt-1 text-xs text-red-400">{formErrors.email}</p>}
              </div>
              <div>
                <label className="label">Endereço</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input" />
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
