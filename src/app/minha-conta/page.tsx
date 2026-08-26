'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Loader2,
  Save,
  ArrowLeft,
  Flame,
  MapPin,
  CreditCard,
  Cake,
  X,
  CheckCircle,
  CalendarCheck,
  Star,
  Lock,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  profile: {
    address: string | null;
    city: string | null;
    state: string | null;
    zipCode: string | null;
    birthDate: string | null;
    cpf: string | null;
  } | null;
}

const ROLE_LABELS: Record<string, string> = {
  CLIENT: 'Cliente',
  ADMIN: 'Administrador',
};

const ROLE_COLORS: Record<string, string> = {
  CLIENT: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-purple-100 text-purple-700',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function MinhaContaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', state: '', zipCode: '', cpf: '', birthDate: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && (session?.user as any)?.id) {
      fetchProfile((session.user as any).id);
    }
  }, [status, session, router]);

  async function fetchProfile(userId: string) {
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (!res.ok) throw new Error('Erro ao carregar perfil');
      const data = await res.json();
      setProfile(data);
      setForm({
        name: data.name,
        phone: data.phone || '',
        address: data.profile?.address || '',
        city: data.profile?.city || '',
        state: data.profile?.state || '',
        zipCode: data.profile?.zipCode || '',
        cpf: data.profile?.cpf || '',
        birthDate: data.profile?.birthDate ? data.profile.birthDate.split('T')[0] : '',
      });
    } catch {
      setError('Erro ao carregar dados do perfil');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch(`/api/users/${profile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim() || null,
          address: form.address.trim() || null,
          city: form.city.trim() || null,
          state: form.state.trim() || null,
          zipCode: form.zipCode.trim() || null,
          cpf: form.cpf.trim() || null,
          birthDate: form.birthDate || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar');
      }

      const updated = await res.json();
      setProfile({ ...profile, name: updated.name, phone: updated.phone, profile: updated.profile });
      setEditing(false);
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <p className="text-slate-600">Perfil não encontrado.</p>
          <Link href="/" className="mt-4 inline-block text-amber-600 hover:text-amber-700">
            Voltar ao início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao início
        </Link>

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
        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <p className="text-sm font-medium text-emerald-700">{success}</p>
          </div>
        )}

        <div className="mb-8 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 shadow-xl">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-2xl font-bold text-white shadow-lg shadow-amber-500/30">
              {getInitials(profile.name)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
              <p className="mt-1 text-sm text-slate-300">{profile.email}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${ROLE_COLORS[profile.role] || 'bg-slate-100 text-slate-700'}`}>
                  {ROLE_LABELS[profile.role] || profile.role}
                </span>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${profile.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {profile.active ? 'Conta ativa' : 'Conta inativa'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">Dados Pessoais</h2>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
                  >
                    Editar
                  </button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleSave} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-700">Nome</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                          id="name" type="text" value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-slate-700">Telefone</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                          id="phone" type="tel" value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                          placeholder="(00) 00000-0000"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-slate-700">Endereço</label>
                    <div className="relative">
                      <MapPin className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <input
                        id="address" type="text" value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                        placeholder="Rua, número, bairro"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-slate-700">Cidade</label>
                      <input
                        id="city" type="text" value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                    <div>
                      <label htmlFor="state" className="mb-1.5 block text-sm font-medium text-slate-700">Estado</label>
                      <input
                        id="state" type="text" value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                        maxLength={2}
                      />
                    </div>
                    <div>
                      <label htmlFor="zipCode" className="mb-1.5 block text-sm font-medium text-slate-700">CEP</label>
                      <input
                        id="zipCode" type="text" value={form.zipCode}
                        onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-900 outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                        placeholder="00000-000"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="cpf" className="mb-1.5 block text-sm font-medium text-slate-700">CPF</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                          id="cpf" type="text" value={form.cpf}
                          onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="birthDate" className="mb-1.5 block text-sm font-medium text-slate-700">Data de Nascimento</label>
                      <div className="relative">
                        <Cake className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                        <input
                          id="birthDate" type="date" value={form.birthDate}
                          onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit" disabled={saving}
                      className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-700 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditing(false);
                        setForm({
                          name: profile.name,
                          phone: profile.phone || '',
                          address: profile.profile?.address || '',
                          city: profile.profile?.city || '',
                          state: profile.profile?.state || '',
                          zipCode: profile.profile?.zipCode || '',
                          cpf: profile.profile?.cpf || '',
                          birthDate: profile.profile?.birthDate ? profile.profile.birthDate.split('T')[0] : '',
                        });
                        setError('');
                      }}
                      className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-0 divide-y divide-slate-100">
                  {[
                    { icon: User, label: 'Nome', value: profile.name },
                    { icon: Mail, label: 'Email', value: profile.email },
                    { icon: Phone, label: 'Telefone', value: profile.phone || 'Não informado' },
                    { icon: MapPin, label: 'Endereço', value: profile.profile?.address ? `${profile.profile.address}${profile.profile.city ? `, ${profile.profile.city}` : ''}${profile.profile.state ? ` - ${profile.profile.state}` : ''}${profile.profile.zipCode ? ` (${profile.profile.zipCode})` : ''}` : null },
                    { icon: CreditCard, label: 'CPF', value: profile.profile?.cpf },
                    { icon: Cake, label: 'Data de Nascimento', value: profile.profile?.birthDate ? formatDate(profile.profile.birthDate) : null },
                    { icon: Shield, label: 'Tipo de conta', value: ROLE_LABELS[profile.role] || profile.role },
                    { icon: Calendar, label: 'Membro desde', value: formatDate(profile.createdAt) },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        <item.icon className="h-5 w-5 text-slate-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-400">{item.label}</p>
                        <p className="truncate text-sm font-medium text-slate-900">{item.value || 'Não informado'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50">
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-400">Acesso rápido</h3>
              <div className="space-y-3">
                <Link
                  href="/minhas-reservas"
                  className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-amber-200 hover:bg-amber-50 hover:shadow-md group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-200">
                    <CalendarCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Minhas Reservas</p>
                    <p className="text-xs text-slate-500">Veja suas reservas de sauna e aluguel</p>
                  </div>
                </Link>
                <Link
                  href="/minhas-avaliacoes"
                  className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-amber-200 hover:bg-amber-50 hover:shadow-md group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-200">
                    <Star className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Avaliações</p>
                    <p className="text-xs text-slate-500">Veja e deixe suas avaliações</p>
                  </div>
                </Link>
                <Link
                  href="/esqueci-senha"
                  className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4 transition-all hover:border-amber-200 hover:bg-amber-50 hover:shadow-md group"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition-colors group-hover:bg-amber-200">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Alterar Senha</p>
                    <p className="text-xs text-slate-500">Redefina sua senha de acesso</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Status da conta</h3>
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${profile.active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="text-sm font-medium text-slate-700">{profile.active ? 'Conta ativa' : 'Conta inativa'}</span>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Última atualização: {formatDate(profile.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
