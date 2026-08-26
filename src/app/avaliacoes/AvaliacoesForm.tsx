'use client';

import { useState } from 'react';
import StarRating from '@/components/ui/StarRating';
import { Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function AvaliacoesForm() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setMessage('Selecione uma nota de 1 a 5 estrelas.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    setSuccess(false);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });
      if (res.ok) {
        setMessage('Avaliação enviada com sucesso! Ela será publicada após aprovação.');
        setSuccess(true);
        setRating(0);
        setComment('');
      } else {
        const data = await res.json();
        setMessage(data.error || 'Erro ao enviar avaliação.');
        setSuccess(false);
      }
    } catch {
      setMessage('Erro ao enviar avaliação.');
      setSuccess(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label className="mb-2 block text-sm font-bold text-dark-700">Nota</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        {rating > 0 && (
          <p className="mt-2 text-xs font-medium text-brand-600">
            {rating === 1 && '⭐ Péssimo'}
            {rating === 2 && '⭐⭐ Ruim'}
            {rating === 3 && '⭐⭐⭐ Regular'}
            {rating === 4 && '⭐⭐⭐⭐ Bom'}
            {rating === 5 && '⭐⭐⭐⭐⭐ Excelente'}
          </p>
        )}
      </div>
      <div className="mb-6">
        <label className="mb-2 block text-sm font-bold text-dark-700">Comentário (opcional)</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-dark-200 bg-dark-50/50 px-4 py-3 text-sm text-dark-800 transition-colors placeholder:text-dark-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Conte como foi sua experiência..."
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand-500 hover:shadow-lg hover:shadow-brand-600/30 disabled:opacity-50 disabled:hover:shadow-none"
      >
        {submitting ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Enviando...
          </>
        ) : (
          <>
            <Send className="h-4 w-4" />
            Enviar avaliação
          </>
        )}
      </button>
      {message && (
        <div className={`mt-4 flex items-start gap-2 rounded-xl p-3 text-sm ${success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {success ? <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" /> : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />}
          {message}
        </div>
      )}
    </form>
  );
}
