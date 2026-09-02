'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDateTime } from '@/lib/utils';
import {
  Loader2, Plus, Shield, Edit2, X, AlertCircle, UserCheck, UserX, Mail, Lock,
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  role: string;
}

const emptyForm: FormData = { name: '', email: '', password: '', role: 'FUNCIONARIO' };

export default function UsuariosPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Erro ao carregar usuários');
      setUsers(await res.json());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditingId(u.id);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setFormErrors({});
    setShowModal(true);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Nome é obrigatório';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email inválido';
    if (!editingId && (!form.password || form.password.length < 6)) errs.password = 'Senha deve ter pelo menos 6 caracteres';
    if (editingId && form.password && form.password.length < 6) errs.password = 'Senha deve ter pelo menos 6 caracteres';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setError('');
    try {
      const body: any = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
      };
      if (form.password) body.password = form.password;

      const url = editingId ? `/api/users/${editingId}` : '/api/users';
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
      fetchUsers();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: User) => {
    if (!window.confirm(`${u.active ? 'Desativar' : 'Ativar'} usuário "${u.name}"?`)) return;
    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !u.active }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao alterar status');
      }
      fetchUsers();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto mb-3 h-10 w-10 text-dark-600" />
          <p className="text-sm text-dark-500">Acesso restrito a administradores</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Usuários</h1>
          <p className="text-sm text-dark-400">{users.length} usuário(s)</p>
        </div>
        <button onClick={openCreate} className="btn-gold">
          <Plus className="h-4 w-4" /> Novo Usuário
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-600/30 bg-red-600/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
        </div>
      ) : users.length === 0 ? (
        <div className="card flex flex-col items-center py-12">
          <Shield className="mb-3 h-10 w-10 text-dark-600" />
          <p className="text-sm text-dark-500">Nenhum usuário encontrado</p>
        </div>
      ) : (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dark-800 text-dark-400">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Criado em</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="table-row">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-600/20 text-xs font-bold text-gold-500">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white">{u.name}</p>
                        <p className="text-xs text-dark-500 sm:hidden">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-dark-300 hidden sm:table-cell">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={u.role === 'ADMIN' ? 'badge-gold' : 'badge-gray'}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    {u.active ? <span className="badge-green">Ativo</span> : <span className="badge-red">Inativo</span>}
                  </td>
                  <td className="px-4 py-3 text-dark-400 hidden md:table-cell">{formatDateTime(u.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(u)} className="rounded p-1.5 text-dark-400 hover:text-gold-400 hover:bg-dark-800" title="Editar">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => toggleActive(u)}
                        className={`rounded p-1.5 hover:bg-dark-800 ${u.active ? 'text-dark-400 hover:text-red-400' : 'text-dark-400 hover:text-green-400'}`}
                        title={u.active ? 'Desativar' : 'Ativar'}
                      >
                        {u.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
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
          <div className="w-full max-w-md rounded-t-xl bg-dark-900 border border-dark-800 sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-dark-800 p-4">
              <h3 className="text-sm font-semibold text-white">{editingId ? 'Editar Usuário' : 'Novo Usuário'}</h3>
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
              <div>
                <label className="label">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`input ${formErrors.email ? 'border-red-600' : ''}`}
                />
                {formErrors.email && <p className="mt-1 text-xs text-red-400">{formErrors.email}</p>}
              </div>
              <div>
                <label className="label">
                  <span className="flex items-center gap-1.5">
                    <Lock className="h-3 w-3" />
                    Senha {editingId ? '(deixe vazio para manter)' : '*'}
                  </span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`input ${formErrors.password ? 'border-red-600' : ''}`}
                  placeholder={editingId ? '••••••••' : ''}
                />
                {formErrors.password && <p className="mt-1 text-xs text-red-400">{formErrors.password}</p>}
              </div>
              <div>
                <label className="label">Perfil</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="select"
                >
                  <option value="FUNCIONARIO">Funcionário</option>
                  <option value="ADMIN">Administrador</option>
                </select>
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
