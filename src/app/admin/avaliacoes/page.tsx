'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Star, Check, EyeOff, Trash2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface ReviewData {
  id: string;
  rating: number;
  comment?: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string };
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  APPROVED: { label: 'Aprovada', color: 'bg-green-100 text-green-800' },
  HIDDEN: { label: 'Oculta', color: 'bg-gray-100 text-gray-600' },
};

export default function AvaliacoesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const fetchReviews = () => {
    fetch('/api/admin/reviews')
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    await fetch(`/api/admin/reviews/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchReviews();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta avaliação?')) return;
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
    setReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const filtered = filter === 'ALL' ? reviews : reviews.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-sauna-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Avaliações</h1>

      <div className="flex flex-wrap gap-2">
        {['ALL', 'PENDING', 'APPROVED', 'HIDDEN'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`badge cursor-pointer ${filter === s ? 'bg-sauna-600 text-white' : STATUS_MAP[s]?.color || 'bg-gray-100'}`}>
            {s === 'ALL' ? 'Todas' : STATUS_MAP[s]?.label || s}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((r) => (
          <div key={r.id} className="admin-card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className={`badge ${STATUS_MAP[r.status]?.color || 'bg-gray-100'}`}>
                    {STATUS_MAP[r.status]?.label || r.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Por <strong>{r.user?.name}</strong> em {formatDate(r.createdAt)}
                </p>
                {r.comment && <p className="mt-2 text-sm text-gray-700">{r.comment}</p>}
              </div>
              <div className="flex gap-1">
                {r.status !== 'APPROVED' && (
                  <button onClick={() => handleStatusChange(r.id, 'APPROVED')} className="rounded p-1 text-green-600 hover:bg-green-50" title="Aprovar">
                    <Check className="h-4 w-4" />
                  </button>
                )}
                {r.status !== 'HIDDEN' && (
                  <button onClick={() => handleStatusChange(r.id, 'HIDDEN')} className="rounded p-1 text-gray-600 hover:bg-gray-50" title="Ocultar">
                    <EyeOff className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => handleDelete(r.id)} className="rounded p-1 text-red-600 hover:bg-red-50" title="Excluir">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="admin-card text-center text-gray-500">Nenhuma avaliação encontrada.</div>
        )}
      </div>
    </div>
  );
}
