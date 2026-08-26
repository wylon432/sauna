'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Loader2,
  Plus,
  Save,
  Trash2,
  Clock,
  Users,
  X,
  Package,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Ban,
} from 'lucide-react';
import { formatDate, DAYS_OF_WEEK, GENDERS, SAUNA_STATUS } from '@/lib/utils';

interface Schedule {
  id: string;
  dayOfWeek: number;
  dayName: string;
  gender: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

interface SessionData {
  id: string;
  date: string;
  dayOfWeek: string;
  gender: string;
  initialStock: number;
  consumedStock: number;
  remainingStock: number;
  totalValue: number;
  receivedValue: number;
  pendingValue: number;
  status: string;
}

interface Reservation {
  id: string;
  date: string;
  status: string;
  notes?: string;
  user: { name: string; email: string };
  schedule: { dayName: string; gender: string; startTime: string; endTime: string };
}

export default function SaunaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [tab, setTab] = useState<'schedules' | 'reservations' | 'sessions'>('schedules');

  const [form, setForm] = useState({
    dayOfWeek: 1,
    gender: 'MASCULINO',
    startTime: '08:00',
    endTime: '12:00',
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/sauna/schedules').then((r) => r.json()),
      fetch('/api/admin/sauna/reservations').then((r) => r.json()),
      fetch('/api/admin/sauna/sessions').then((r) => r.json()),
    ])
      .then(([s, r, ss]) => {
        setSchedules(s.schedules || []);
        setReservations(r.reservations || []);
        setSessions(ss.sessions || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveSchedule = async () => {
    const url = editingSchedule ? `/api/admin/sauna/schedules/${editingSchedule.id}` : '/api/admin/sauna/schedules';
    const method = editingSchedule ? 'PUT' : 'POST';
    const dayName = DAYS_OF_WEEK[form.dayOfWeek] || '';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, dayName }),
    });
    const s = await fetch('/api/admin/sauna/schedules').then((r) => r.json());
    setSchedules(s.schedules || []);
    setShowForm(false);
    setEditingSchedule(null);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Excluir este horário?')) return;
    await fetch(`/api/admin/sauna/schedules/${id}`, { method: 'DELETE' });
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleSchedule = async (id: string, active: boolean) => {
    await fetch(`/api/admin/sauna/schedules/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !active }),
    });
    setSchedules((prev) => prev.map((s) => (s.id === id ? { ...s, active: !active } : s)));
  };

  const handleCancelReservation = async (id: string) => {
    if (!confirm('Cancelar esta reserva?')) return;
    await fetch(`/api/sauna/reservations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'CANCELLED' }),
    });
    const r = await fetch('/api/admin/sauna/reservations').then((res) => res.json());
    setReservations(r.reservations || []);
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Gerenciamento de Sauna</h1>
        {tab === 'schedules' && (
          <button
            onClick={() => { setEditingSchedule(null); setShowForm(true); setForm({ dayOfWeek: 1, gender: 'MASCULINO', startTime: '08:00', endTime: '12:00' }); }}
            className="btn-primary"
          >
            <Plus className="mr-2 h-4 w-4" /> Novo Horário
          </button>
        )}
      </div>

      <div className="flex gap-2 border-b">
        {[
          { key: 'schedules' as const, label: 'Horários', icon: Clock },
          { key: 'reservations' as const, label: 'Reservas', icon: Users },
          { key: 'sessions' as const, label: 'Sessões', icon: Package },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              tab === t.key
                ? 'border-sauna-600 text-sauna-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="admin-card space-y-4">
          <h3 className="text-lg font-semibold">{editingSchedule ? 'Editar Horário' : 'Novo Horário'}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="label">Dia da Semana</label>
              <select
                className="input"
                value={form.dayOfWeek}
                onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })}
              >
                {DAYS_OF_WEEK.map((d, i) => (
                  <option key={i} value={i}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Gênero</label>
              <select
                className="input"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                {Object.entries(GENDERS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Início</label>
              <input className="input" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div>
              <label className="label">Fim</label>
              <input className="input" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveSchedule} className="btn-primary"><Save className="mr-2 h-4 w-4" /> Salvar</button>
            <button onClick={() => { setShowForm(false); setEditingSchedule(null); }} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      {tab === 'schedules' && (
        <div className="admin-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Dia</th>
                <th className="table-header">Gênero</th>
                <th className="table-header">Horário</th>
                <th className="table-header">Status</th>
                <th className="table-header">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {schedules.map((s) => (
                <tr key={s.id}>
                  <td className="table-cell font-medium">{s.dayName}</td>
                  <td className="table-cell">{GENDERS[s.gender] || s.gender}</td>
                  <td className="table-cell">{s.startTime} - {s.endTime}</td>
                  <td className="table-cell">
                    <button
                      onClick={() => handleToggleSchedule(s.id, s.active)}
                      className={`badge ${s.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                    >
                      {s.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="table-cell">
                    <div className="flex gap-2">
                      <button onClick={() => { setForm({ dayOfWeek: s.dayOfWeek, gender: s.gender, startTime: s.startTime, endTime: s.endTime }); setEditingSchedule(s); setShowForm(true); }} className="text-sauna-600 hover:text-sauna-800">
                        Editar
                      </button>
                      <button onClick={() => handleDeleteSchedule(s.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr><td colSpan={5} className="table-cell text-center text-gray-500">Nenhum horário cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'reservations' && (
        <div className="admin-card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header">Cliente</th>
                <th className="table-header">Data</th>
                <th className="table-header">Horário</th>
                <th className="table-header">Gênero</th>
                <th className="table-header">Status</th>
                <th className="table-header">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td className="table-cell font-medium">{r.user?.name}</td>
                  <td className="table-cell">{formatDate(r.date)}</td>
                  <td className="table-cell">{r.schedule?.startTime} - {r.schedule?.endTime}</td>
                  <td className="table-cell">{GENDERS[r.schedule?.gender] || r.schedule?.gender}</td>
                  <td className="table-cell">
                    <span className={`badge ${SAUNA_STATUS[r.status]?.color || 'bg-gray-100'}`}>
                      {SAUNA_STATUS[r.status]?.label || r.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    {r.status !== 'CANCELLED' && (
                      <button onClick={() => handleCancelReservation(r.id)} className="rounded p-1 text-red-600 hover:bg-red-50" title="Cancelar">
                        <Ban className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {reservations.length === 0 && (
                <tr><td colSpan={6} className="table-cell text-center text-gray-500">Nenhuma reserva encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'sessions' && (
        <div className="space-y-4">
          {sessions.map((s) => (
            <div key={s.id} className="admin-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{formatDate(s.date)} - {GENDERS[s.gender] || s.gender}</h3>
                  <p className="text-sm text-gray-500">{s.dayOfWeek}</p>
                </div>
                <span className={`badge ${s.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {s.status === 'OPEN' ? 'Aberta' : 'Fechada'}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <p className="text-xs text-blue-600">Estoque Inicial</p>
                  <p className="text-lg font-bold text-blue-800">{s.initialStock}</p>
                </div>
                <div className="rounded-lg bg-orange-50 p-3 text-center">
                  <p className="text-xs text-orange-600">Consumido</p>
                  <p className="text-lg font-bold text-orange-800">{s.consumedStock}</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <p className="text-xs text-green-600">Restante</p>
                  <p className="text-lg font-bold text-green-800">{s.remainingStock}</p>
                </div>
                <div className="rounded-lg bg-purple-50 p-3 text-center">
                  <p className="text-xs text-purple-600">Total</p>
                  <p className="text-lg font-bold text-purple-800">R$ {s.totalValue.toFixed(2)}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3 text-center">
                  <p className="text-xs text-emerald-600">Recebido</p>
                  <p className="text-lg font-bold text-emerald-800">R$ {s.receivedValue.toFixed(2)}</p>
                </div>
                <div className="rounded-lg bg-red-50 p-3 text-center">
                  <p className="text-xs text-red-600">Pendente</p>
                  <p className="text-lg font-bold text-red-800">R$ {s.pendingValue.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="admin-card text-center text-gray-500">Nenhuma sessão registrada.</div>
          )}
        </div>
      )}
    </div>
  );
}
