'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import {
  Loader2, Save, Trash2, Edit2, Eye, EyeOff,
  ArrowUp, ArrowDown, ImagePlus, Upload, Link as LinkIcon, X, AlertTriangle,
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

function isVideoUrl(url: string): boolean {
  if (!url) return false;
  if (url.startsWith('data:video')) return true;
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) return true;
  return false;
}

function compressImage(file: File, maxWidth = 1000, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = URL.createObjectURL(file);
  });
}

export default function GaleriaPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<GalleryImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GalleryImageData | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [form, setForm] = useState({ url: '', title: '', description: '', category: 'GERAL', isMain: false, published: true, sortOrder: 0 });
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');

    const isVideo = file.type.startsWith('video/');

    if (isVideo) {
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Vídeo muito grande. Máximo 10MB.');
        return;
      }
      setUploading(true);
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          setForm(prev => ({ ...prev, url: base64 }));
          setPreview(base64);
          setUploading(false);
        };
        reader.onerror = () => { setUploadError('Erro ao ler vídeo.'); setUploading(false); };
        reader.readAsDataURL(file);
      } catch {
        setUploadError('Erro ao processar vídeo.');
        setUploading(false);
      }
    } else {
      if (file.size > 20 * 1024 * 1024) {
        setUploadError('Imagem muito grande. Máximo 20MB (será comprimida automaticamente).');
        return;
      }
      setUploading(true);
      try {
        const base64 = await compressImage(file);
        setForm(prev => ({ ...prev, url: base64 }));
        setPreview(base64);
        setUploading(false);
      } catch {
        setUploadError('Erro ao processar imagem.');
        setUploading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!form.url) {
      setUploadError('Selecione um arquivo ou insira uma URL.');
      return;
    }

    if (uploadMode === 'url' && form.url && !form.url.startsWith('data:') && !form.url.startsWith('http')) {
      setUploadError('URL inválida. Deve começar com http:// ou https://');
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const apiUrl = editing ? `/api/admin/gallery/${editing.id}` : '/api/admin/gallery';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Save failed');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ url: '', title: '', description: '', category: 'GERAL', isMain: false, published: true, sortOrder: 0 });
      setPreview(null);
      setUploadMode('file');
      fetchImages();
    } catch (e: any) {
      setUploadError(e.message || 'Erro ao salvar. Verifique o tamanho do arquivo.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta mídia?')) return;
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

  const openForm = () => {
    setEditing(null);
    setForm({ url: '', title: '', description: '', category: 'GERAL', isMain: false, published: true, sortOrder: 0 });
    setPreview(null);
    setUploadError('');
    setUploadMode('file');
    setShowForm(true);
  };

  const openEdit = (img: GalleryImageData) => {
    setEditing(img);
    setForm({ url: img.url, title: img.title || '', description: img.description || '', category: img.category, isMain: img.isMain, published: img.published, sortOrder: img.sortOrder });
    setPreview(null);
    setUploadError('');
    setUploadMode('url');
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-dark-900">Galeria</h1>
        <button onClick={openForm} className="btn-primary">
          <ImagePlus className="mr-2 h-4 w-4" /> Nova Mídia
        </button>
      </div>

      {showForm && (
        <div className="admin-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{editing ? 'Editar Mídia' : 'Nova Mídia'}</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); setPreview(null); }} className="text-dark-400 hover:text-dark-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <div className="mb-3 flex gap-2">
                <button
                  onClick={() => { setUploadMode('file'); setPreview(null); setForm({ ...form, url: '' }); setUploadError(''); }}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    uploadMode === 'file' ? 'bg-brand-600 text-white' : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                  }`}
                >
                  <Upload className="h-4 w-4" /> Enviar arquivo
                </button>
                <button
                  onClick={() => { setUploadMode('url'); setPreview(null); setForm({ ...form, url: '' }); setUploadError(''); }}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    uploadMode === 'url' ? 'bg-brand-600 text-white' : 'bg-dark-100 text-dark-600 hover:bg-dark-200'
                  }`}
                >
                  <LinkIcon className="h-4 w-4" /> Colar URL
                </button>
              </div>

              {uploadMode === 'file' ? (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-dashed border-dark-300 bg-dark-50 px-6 py-10 text-center transition-colors hover:border-brand-400 hover:bg-brand-50"
                  >
                    {uploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-dark-400" />
                        <div>
                          <p className="font-semibold text-dark-700">Clique para selecionar</p>
                          <p className="mt-1 text-xs text-dark-400">Imagens (JPG, PNG, WebP) — será comprimida automaticamente</p>
                          <p className="text-xs text-dark-400">Vídeos (MP4, WebM) — máx. 10MB</p>
                        </div>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div>
                  <label className="label">URL da Imagem ou Vídeo</label>
                  <input
                    className="input"
                    value={uploadMode === 'url' ? form.url : ''}
                    onChange={(e) => { setForm({ ...form, url: e.target.value }); setPreview(null); setUploadError(''); }}
                    placeholder="https://exemplo.com/foto.jpg"
                  />
                  <p className="mt-1 text-xs text-dark-400">Link direto para imagem ou vídeo (.jpg, .png, .mp4)</p>
                </div>
              )}

              {uploadError && (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {uploadError}
                </div>
              )}

              {(preview || (uploadMode === 'url' && form.url)) && (
                <div className="mt-4 relative inline-block">
                  {isVideoUrl(preview || form.url) ? (
                    <video
                      src={preview || form.url}
                      className="max-h-40 rounded-lg"
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={preview || form.url}
                      alt="Preview"
                      className="max-h-40 rounded-lg object-cover"
                      onError={(e) => {
                        setUploadError('Não foi possível carregar a imagem. Verifique a URL.');
                      }}
                    />
                  )}
                  <button
                    onClick={() => { setForm({ ...form, url: '' }); setPreview(null); setUploadError(''); }}
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
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
            <button onClick={handleSave} disabled={uploading || !form.url} className="btn-primary disabled:opacity-50">
              {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {editing ? 'Salvar' : 'Adicionar'}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); setPreview(null); }} className="btn-secondary">Cancelar</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {images.map((img) => (
          <div key={img.id} className="admin-card overflow-hidden">
            <div className="relative aspect-square bg-dark-100">
              {isVideoUrl(img.url) ? (
                <video src={img.url} className="h-full w-full object-cover" muted preload="metadata" />
              ) : (
                <img
                  src={img.url}
                  alt={img.title || ''}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="absolute right-2 top-2 flex gap-1">
                {isVideoUrl(img.url) && <span className="badge bg-purple-600 text-white">Vídeo</span>}
                {img.isMain && <span className="badge bg-brand-600 text-white">Principal</span>}
                {!img.published && <span className="badge bg-dark-600 text-white">Rascunho</span>}
              </div>
            </div>
            <div className="p-3">
              <p className="font-medium text-sm text-dark-900 truncate">{img.title || 'Sem título'}</p>
              <p className="text-xs text-dark-400">{img.category} &bull; #{img.sortOrder}</p>
              <div className="mt-2 flex gap-1">
                <button onClick={() => handleTogglePublished(img)} className="rounded p-1 text-dark-400 hover:text-dark-600" title={img.published ? 'Ocultar' : 'Publicar'}>
                  {img.published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => openEdit(img)} className="rounded p-1 text-blue-600 hover:bg-blue-50"><Edit2 className="h-4 w-4" /></button>
                <button onClick={() => handleMove(img, 'up')} className="rounded p-1 text-dark-400 hover:text-dark-600"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => handleMove(img, 'down')} className="rounded p-1 text-dark-400 hover:text-dark-600"><ArrowDown className="h-4 w-4" /></button>
                <button onClick={() => handleDelete(img.id)} className="rounded p-1 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        {images.length === 0 && (
          <div className="col-span-full admin-card text-center text-dark-400 py-12">
            <ImagePlus className="mx-auto mb-3 h-10 w-10 text-dark-300" />
            <p>Nenhuma mídia na galeria. Clique em &quot;Nova Mídia&quot; para adicionar.</p>
          </div>
        )}
      </div>
    </div>
  );
}
