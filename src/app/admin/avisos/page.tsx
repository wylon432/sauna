'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Loader2,
  Plus,
  Save,
  Trash2,
  Edit2,
  X,
  Megaphone,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface AnnouncementData {
  id: string;
  text: string;
  service: string;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
}

const SERVICES = ['GERAL', 'SAUNA', 'PISCINA', 'ALUGUEL'];
const SERVICE_LABELS: Record<string, string> = { GERAL: 'Geral', SAUNA: 'Sauna', PISCINA: 'Piscina', ALUGUEL: 'Aluguel' };

export default function AvisosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AnnouncementData | null>(null);
  const [form, setForm] = useState({ text: '', service: 'GERAL', startDate: '', endDate: '' });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchAnnouncements = () => {
    fetch('/api/admin/announcements')
      .then((r) => r.json())
      .then((d) => setAnnouncements(d.announcements || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const handleSave = async () => {
    const url = editing ? `/api/admin/announcements/${editing.id}` : '/api/admin/announcements';
    const method = editing ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
      }),
    });
    setShowForm(false);
    setEditing(null);
    setForm({ text: '', service: 'GERAL', startDate: '', endDate: '' });
    fetchAnnouncements();
  };

  const handleToggleActive = async (id: string) => {
    await fetch(`/api/admin/announcements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !announcements.find((a) => a.id === id)?.active }),
    });
    fetchAnnouncements();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este aviso?')) return;
    await fetch(`/api/admin/announcements/${id}`, { method: 'DELETE' });
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
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
        <h1 className="text-2xl font-bold text-gray-900">Avisos</h1>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ text: '', service: 'GERAL', startDate: '', endDate: '' });
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Megaphone className="mr-2 h-4 w-4" /> Novo Aviso
        </button>
      </div>

      {showForm && (
        <div className="admin-card space-y-4">
          <h3 className="font-semibold">{editing ? 'Editar Aviso' : 'Novo Aviso'}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Texto do Aviso</label>
              <textarea className="input" rows={3} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
            </div>
            <div>
              <label className="label">Serviço</label>
              <select className="input" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
                {SERVICES.map((s) => <option key={s} value={s}>{SERVICE_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Data Início</label>
              <input className="input" type="datetime-local" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="label">Data Fim</label>
              <input className="input" type="datetime-local" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary"><Save className="mr-2 h-4 w-4" /> Salvar</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {announcements.map((a) => {
          const isExpired = new Date(a.endDate) < new Date();
          return (
            <div key={a.id} className={`admin-card ${isExpired ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="badge bg-blue-100 text-blue-800">{SERVICE_LABELS[a.service] || a.service}</span>
                    {isExpired && <span className="badge bg-gray-100 text-gray-600">Expirado</span>}
                    <button onClick={() => handleToggleActive(a.id)}>
                      {a.active ? <ToggleRight className="h-6 w-6 text-green-600" /> : <ToggleLeft className="h-6 w-6 text-gray-400" />}
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">{a.text}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDate(a.startDate)} até {formatDate(a.endDate)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditing(a);
                      setForm({
                        text: a.text,
                        service: a.service,
                        startDate: new Date(a.startDate).toISOString().slice(0, 16),
                        endDate: new Date(a.endDate).toISOString().slice(0, 16),
                      });
                      setShowForm(true);
                    }}
                    className="rounded p-1 text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="rounded p-1 text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {announcements.length === 0 && (
          <div className="admin-card text-center text-gray-500">Nenhum aviso encontrado.</div>
        )}
      </div>
    </div>
  );
}
