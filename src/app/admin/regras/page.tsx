'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Loader2,
  Plus,
  Save,
  Edit2,
  ShieldCheck,
  Eye,
  X,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface RuleData {
  id: string;
  type: string;
  content: string;
  version: number;
  active: boolean;
  author?: string;
  createdAt: string;
}

const RULE_TYPES = ['GERAL', 'SAUNA', 'PISCINA', 'ALUGUEL'];
const TYPE_LABELS: Record<string, string> = { GERAL: 'Geral', SAUNA: 'Sauna', PISCINA: 'Piscina', ALUGUEL: 'Aluguel' };

export default function RegrasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rules, setRules] = useState<RuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'GERAL', content: '' });
  const [selectedRule, setSelectedRule] = useState<RuleData | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchRules = () => {
    fetch('/api/admin/rules')
      .then((r) => r.json())
      .then((d) => setRules(d.rules || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRules(); }, []);

  const handleCreate = async () => {
    await fetch('/api/admin/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm({ type: 'GERAL', content: '' });
    fetchRules();
  };

  const handleUpdate = async (rule: RuleData) => {
    await fetch(`/api/admin/rules/${rule.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: rule.content }),
    });
    fetchRules();
  };

  const grouped = RULE_TYPES.map((type) => ({
    type,
    rules: rules.filter((r) => r.type === type).sort((a, b) => b.version - a.version),
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
        <h1 className="text-2xl font-bold text-gray-900">Regras</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <Plus className="mr-2 h-4 w-4" /> Nova Versão
        </button>
      </div>

      {showForm && (
        <div className="admin-card space-y-4">
          <h3 className="font-semibold">Nova Versão de Regras</h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {RULE_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Conteúdo (suporta HTML)</label>
              <textarea className="input font-mono text-sm" rows={16} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
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
            {group.rules.length === 0 ? (
              <p className="text-sm text-gray-500">Nenhuma regra criada.</p>
            ) : (
              <div className="space-y-2">
                {group.rules.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded border p-3">
                    <div>
                      <p className="text-sm font-medium">Versão {r.version} {r.active ? '(Ativa)' : '(Inativa)'}</p>
                      <p className="text-xs text-gray-500">{formatDate(r.createdAt)} {r.author ? `• ${r.author}` : ''}</p>
                      <p className="mt-1 text-xs text-gray-600 line-clamp-2">{r.content.replace(/<[^>]+>/g, '').slice(0, 150)}...</p>
                    </div>
                    <button onClick={() => setSelectedRule(r)} className="rounded p-1 text-blue-600 hover:bg-blue-50"><Eye className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">{TYPE_LABELS[selectedRule.type]} - v{selectedRule.version}</h3>
              <button onClick={() => setSelectedRule(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: selectedRule.content }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
