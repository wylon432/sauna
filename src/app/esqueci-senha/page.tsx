'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Flame, Loader2, CheckCircle } from 'lucide-react';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erro.'); return; }
      setSuccess(true);
    } catch { setError('Erro ao enviar.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-950 px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[20%] top-[30%] h-[400px] w-[400px] rounded-full bg-brand-600/8 blur-[120px]" />
      </div>
      <div className="relative w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
            <Flame className="h-6 w-6" />
          </div>
        </Link>

        <div className="rounded-3xl border border-dark-800 bg-dark-900/80 p-8 shadow-2xl backdrop-blur-xl">
          {success ? (
            <div className="py-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
              <h2 className="text-lg font-extrabold text-white">Email enviado!</h2>
              <p className="mt-2 text-sm text-dark-400">Verifique sua caixa de entrada para redefinir sua senha.</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-extrabold text-white">Esqueci minha senha</h1>
              <p className="mt-2 text-sm text-dark-400">Informe seu email para receber um link de redefinição.</p>

              {error && <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">{error}</div>}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-dark-500" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="input border-dark-700 bg-dark-800 pl-12 text-white placeholder:text-dark-500 focus:border-brand-500 focus:ring-brand-500/20"
                    placeholder="seu@email.com" required />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-4">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enviar link de redefinição'}
                </button>
              </form>
            </>
          )}

          <p className="mt-6 text-sm text-dark-500">
            Lembrou a senha?{' '}
            <Link href="/login" className="font-bold text-brand-400 hover:text-brand-300">Voltar ao login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
