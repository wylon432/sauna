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
  Eye,
  Send,
  Archive,
  X,
  Newspaper,
} from 'lucide-react';
import { formatDate, NEWS_CATEGORIES, slugify } from '@/lib/utils';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  image?: string;
  category: string;
  author?: string;
  status: string;
  featured: boolean;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Rascunho', color: 'bg-gray-100 text-gray-700' },
  PUBLISHED: { label: 'Publicado', color: 'bg-green-100 text-green-800' },
  ARCHIVED: { label: 'Arquivado', color: 'bg-yellow-100 text-yellow-800' },
};

export default function NoticiasPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [form, setForm] = useState({
    title: '',
    summary: '',
    content: '',
    image: '',
    category: 'GERAL',
    author: '',
    status: 'DRAFT',
    featured: false,
    scheduledAt: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchNews = () => {
    fetch('/api/admin/news')
      .then((r) => r.json())
      .then((d) => setNews(d.news || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchNews(); }, []);

  const handleSave = async () => {
    const url = editing ? `/api/admin/news/${editing.id}` : '/api/admin/news';
    const method = editing ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, slug: slugify(form.title) }),
    });
    setShowForm(false);
    setEditing(null);
    setForm({ title: '', summary: '', content: '', image: '', category: 'GERAL', author: '', status: 'DRAFT', featured: false, scheduledAt: '' });
    fetchNews();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch(`/api/admin/news/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, publishedAt: newStatus === 'PUBLISHED' ? new Date().toISOString() : undefined }),
    });
    fetchNews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta notícia?')) return;
    await fetch(`/api/admin/news/${id}`, { method: 'DELETE' });
    setNews((prev) => prev.filter((n) => n.id !== id));
  };

  const filtered = filter === 'ALL' ? news : news.filter((n) => n.status === filter);

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
        <h1 className="text-2xl font-bold text-gray-900">Notícias</h1>
        <button
          onClick={() => {
            setEditing(null);
            setForm({ title: '', summary: '', content: '', image: '', category: 'GERAL', author: '', status: 'DRAFT', featured: false, scheduledAt: '' });
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Newspaper className="mr-2 h-4 w-4" /> Nova Notícia
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {['ALL', 'DRAFT', 'PUBLISHED', 'ARCHIVED'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`badge cursor-pointer ${filter === s ? 'bg-sauna-600 text-white' : STATUS_MAP[s]?.color || 'bg-gray-100'}`}>
            {s === 'ALL' ? 'Todas' : STATUS_MAP[s]?.label || s}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="admin-card space-y-4">
          <h3 className="font-semibold">{editing ? 'Editar Notícia' : 'Nova Notícia'}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Título</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              {form.title && <p className="text-xs text-gray-500 mt-1">Slug: {slugify(form.title)}</p>}
            </div>
            <div className="sm:col-span-2">
              <label className="label">Resumo</label>
              <input className="input" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Conteúdo</label>
              <textarea className="input" rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">URL da Imagem</label>
              <input className="input" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            </div>
            <div>
              <label className="label">Categoria</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {NEWS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Autor</label>
              <input className="input" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="DRAFT">Rascunho</option>
                <option value="PUBLISHED">Publicado</option>
              </select>
            </div>
            <div>
              <label className="label">Agendar Publicação</label>
              <input className="input" type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="rounded" />
                <span className="text-sm">Destaque</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary"><Save className="mr-2 h-4 w-4" /> Salvar</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((n) => (
          <div key={n.id} className="admin-card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{n.title}</h3>
                {n.featured && <span className="badge bg-sauna-100 text-sauna-700">Destaque</span>}
                <span className={`badge ${STATUS_MAP[n.status]?.color || 'bg-gray-100'}`}>
                  {STATUS_MAP[n.status]?.label || n.status}
                </span>
              </div>
              <p className="text-sm text-gray-500">{n.category} • {n.author || 'Sem autor'} • {formatDate(n.createdAt)}</p>
              {n.summary && <p className="mt-1 text-sm text-gray-600 line-clamp-1">{n.summary}</p>}
            </div>
            <div className="flex gap-1">
              {n.status !== 'PUBLISHED' && (
                <button onClick={() => handleStatusChange(n.id, 'PUBLISHED')} className="rounded p-1 text-green-600 hover:bg-green-50" title="Publicar"><Send className="h-4 w-4" /></button>
              )}
              {n.status !== 'ARCHIVED' && n.status === 'PUBLISHED' && (
                <button onClick={() => handleStatusChange(n.id, 'ARCHIVED')} className="rounded p-1 text-yellow-600 hover:bg-yellow-50" title="Arquivar"><Archive className="h-4 w-4" /></button>
              )}
              <button onClick={() => { setEditing(n); setForm({ title: n.title, summary: n.summary || '', content: n.content, image: n.image || '', category: n.category, author: n.author || '', status: n.status, featured: n.featured, scheduledAt: n.scheduledAt ? new Date(n.scheduledAt).toISOString().slice(0, 16) : '' }); setShowForm(true); }} className="rounded p-1 text-blue-600 hover:bg-blue-50"><Edit2 className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(n.id)} className="rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="admin-card text-center text-gray-500">Nenhuma notícia encontrada.</div>
        )}
      </div>
    </div>
  );
}
