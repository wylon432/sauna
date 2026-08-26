'use client';

import { useState } from 'react';
import StarRating from '@/components/ui/StarRating';

export default function AvaliacoesForm() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setMessage('Selecione uma nota de 1 a 5 estrelas.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });
      if (res.ok) {
        setMessage('Avaliação enviada com sucesso! Ela será publicada após aprovação.');
        setRating(0);
        setComment('');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Erro ao enviar avaliação.');
      }
    } catch {
      setMessage('Erro ao enviar avaliação.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">Deixe sua avaliação</h2>
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Nota</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>
      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Comentário (opcional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-sauna-500 focus:outline-none focus:ring-1 focus:ring-sauna-500"
          placeholder="Escreva seu comentário..."
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-sauna-600 px-4 py-2 text-sm font-medium text-white hover:bg-sauna-700 disabled:opacity-50"
      >
        {submitting ? 'Enviando...' : 'Enviar avaliação'}
      </button>
      {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
    </form>
  );
}
