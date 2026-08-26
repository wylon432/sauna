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
  EyeOff,
  X,
  ArrowUp,
  ArrowDown,
  ImagePlus,
} from 'lucide-react';
import { GALLERY_CATEGORIES } from '@/lib/utils';

interface GalleryImageData {
  id: string;
  title?: string;
  description?: string;
  url: string;
  category: string;
  isMain: boolean;
  published: boolean;
  sortOrder: number;
}

export default function GaleriaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [images, setImages] = useState<GalleryImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GalleryImageData | null>(null);
  const [form, setForm] = useState({ url: '', title: '', description: '', category: 'GERAL', isMain: false, published: true, sortOrder: 0 });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchImages = () => {
    fetch('/api/admin/gallery')
      .then((r) => r.json())
      .then((d) => setImages(d.images || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchImages(); }, []);

  const handleSave = async () => {
    const url = editing ? `/api/admin/gallery/${editing.id}` : '/api/admin/gallery';
    const method = editing ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShowForm(false);
    setEditing(null);
    setForm({ url: '', title: '', description: '', category: 'GERAL', isMain: false, published: true, sortOrder: 0 });
    fetchImages();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta imagem?')) return;
    await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' });
    setImages((prev) => prev.filter((i) => i.id !== id));
  };

  const handleTogglePublished = async (img: GalleryImageData) => {
    await fetch(`/api/admin/gallery/${img.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ published: !img.published }),
    });
    fetchImages();
  };

  const handleMove = async (img: GalleryImageData, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? img.sortOrder - 1 : img.sortOrder + 1;
    await fetch(`/api/admin/gallery/${img.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sortOrder: newOrder }),
    });
    fetchImages();
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
        <h1 className="text-2xl font-bold text-gray-900">Galeria</h1>
        <button
          onClick={() => { setEditing(null); setForm({ url: '', title: '', description: '', category: 'GERAL', isMain: false, published: true, sortOrder: 0 }); setShowForm(true); }}
          className="btn-primary"
        >
          <ImagePlus className="mr-2 h-4 w-4" /> Nova Mídia
        </button>
      </div>

      {showForm && (
        <div className="admin-card space-y-4">
          <h3 className="font-semibold">{editing ? 'Editar Mídia' : 'Nova Mídia'}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">URL da Imagem ou Vídeo</label>
              <input className="input" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://... (aceita JPG, PNG, MP4, WEBM)" />
              <p className="mt-1 text-xs text-gray-500">Cole a URL de uma imagem (JPG, PNG, WebP) ou vídeo (MP4, WebM)</p>
            </div>
            <div>
              <label className="label">Título</label>
              <input className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div>
              <label className="label">Categoria</label>
              <select className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {GALLERY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Descrição</label>
              <textarea className="input" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div>
              <label className="label">Ordem</label>
              <input className="input" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.isMain} onChange={(e) => setForm({ ...form, isMain: e.target.checked })} className="rounded" />
                <span className="text-sm">Principal</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="rounded" />
                <span className="text-sm">Publicado</span>
              </label>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="btn-primary"><Save className="mr-2 h-4 w-4" /> Salvar</button>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="admin-card overflow-hidden">
            <div className="relative aspect-square bg-gray-100">
              {/\.(mp4|webm|ogg|mov)(\?|$)/i.test(img.url) ? (
                <video src={img.url} className="h-full w-full object-cover" muted preload="metadata" />
              ) : (
                <img src={img.url} alt={img.title || ''} className="h-full w-full object-cover" />
              )}
              <div className="absolute right-2 top-2 flex gap-1">
                {/\.(mp4|webm|ogg|mov)(\?|$)/i.test(img.url) && <span className="badge bg-purple-600 text-white">Vídeo</span>}
                {img.isMain && <span className="badge bg-sauna-600 text-white">Principal</span>}
                {!img.published && <span className="badge bg-gray-600 text-white">Rascunho</span>}
              </div>
            </div>
            <div className="p-3">
              <p className="font-medium text-sm">{img.title || 'Sem título'}</p>
              <p className="text-xs text-gray-500">{img.category} • Ordem: {img.sortOrder}</p>
              <div className="mt-2 flex gap-1">
                <button onClick={() => handleTogglePublished(img)} className="rounded p-1 text-gray-400 hover:text-gray-600" title={img.published ? 'Ocultar' : 'Publicar'}>
                  {img.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => { setEditing(img); setForm({ url: img.url, title: img.title || '', description: img.description || '', category: img.category, isMain: img.isMain, published: img.published, sortOrder: img.sortOrder }); setShowForm(true); }} className="rounded p-1 text-blue-600 hover:bg-blue-50"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => handleMove(img, 'up')} className="rounded p-1 text-gray-400 hover:text-gray-600"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => handleMove(img, 'down')} className="rounded p-1 text-gray-400 hover:text-gray-600"><ArrowDown className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(img.id)} className="rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {images.length === 0 && (
          <div className="col-span-full admin-card text-center text-gray-500">Nenhuma mídia na galeria.</div>
        )}
      </div>
    </div>
  );
}
