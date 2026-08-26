'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Loader2,
  Plus,
  Save,
  FileText,
  Check,
  X,
  Eye,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { formatDate, TERMS_TYPES } from '@/lib/utils';

interface TermVersion {
  id: string;
  type: string;
  title: string;
  content: string;
  version: number;
  active: boolean;
  author?: string;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  SAUNA: 'Sauna',
  ALUGUEL: 'Aluguel',
  PRIVACIDADE: 'Privacidade',
  CANCELAMENTO: 'Cancelamento',
};

export default function TermosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [terms, setTerms] = useState<TermVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'SAUNA', title: '', content: '' });
  const [selectedTerm, setSelectedTerm] = useState<TermVersion | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchTerms = () => {
    fetch('/api/admin/terms')
      .then((r) => r.json())
      .then((d) => setTerms(d.terms || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTerms(); }, []);

  const handleCreate = async () => {
    await fetch('/api/admin/terms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ type: 'SAUNA', title: '', content: '' });
    fetchTerms();
  };

  const handleToggleActive = async (id: string) => {
    const term = terms.find((t) => t.id === id);
    if (!term) return;
    await fetch(`/api/admin/terms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !term.active }),
    });
    fetchTerms();
  };

  const grouped = TERMS_TYPES.map((type) => ({
    type,
    versions: terms.filter((t) => t.type === type).sort((a, b) => b.version - a.version),
  }));

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
        <h1 className="text-2xl font-bold text-gray-900">Termos</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" /> Nova Versão
        </button>
      </div>

      {showForm && (
        <div className="admin-card space-y-4">
          <h3 className="font-semibold">Nova Versão de Termos</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {TERMS_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Título</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Conteúdo</label>
              <textarea className="input" rows={12} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="btn-primary"><Save className="mr-2 h-4 w-4" /> Criar Versão</button>
            <button onClick={() => setShowForm(false)} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {grouped.map((group) => (
          <div key={group.type} className="admin-card">
            <h3 className="mb-3 font-semibold text-lg">{TYPE_LABELS[group.type] || group.type}</h3>
            {group.versions.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma versão criada.</p>
            ) : (
              <div className="space-y-2">
                {group.versions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded border p-3">
                    <div>
                      <p className="font-medium text-sm">{t.title} <span className="text-gray-500">v{t.version}</span></p>
                      <p className="text-xs text-gray-500">{formatDate(t.createdAt)} {t.author ? `• ${t.author}` : ''}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setSelectedTerm(t)} className="rounded p-1 text-blue-600 hover:bg-blue-50"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => handleToggleActive(t.id)}>
                        {t.active ? <ToggleRight className="h-6 w-6 text-green-600" /> : <ToggleLeft className="h-6 w-6 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedTerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">{selectedTerm.title} (v{selectedTerm.version})</h3>
              <button onClick={() => setSelectedTerm(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">{selectedTerm.content}</div>
          </div>
        </div>
      )}
    </div>
  );
}
