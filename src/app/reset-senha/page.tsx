'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Eye, EyeOff, Flame, Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

function ResetSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Token de redefinição não encontrado. Solicite uma nova redefinição de senha.');
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token inválido');
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Erro ao redefinir senha');
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch {
      setError('Erro ao redefinir senha. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl" />
          <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-amber-600/5 blur-3xl" />
        </div>
        <div className="relative z-10 w-full max-w-md">
          <div className="mb-10 text-center">
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
                <Flame className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Sauna e Espaço da Janice
              </span>
            </Link>
          </div>
          <div className="rounded-2xl bg-white p-8 shadow-2xl shadow-black/20 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Link inválido</h2>
            <p className="mt-3 text-sm text-slate-500">
              Este link de redefinição de senha é inválido ou está faltando.
            </p>
            <Link
              href="/esqueci-senha"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-700"
            >
              Solicitar nova redefinição
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-amber-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
              <Flame className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              Sauna e Espaço da Janice
            </span>
          </Link>
          <p className="mt-5 text-sm text-slate-400">
            Digite sua nova senha abaixo
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-2xl shadow-black/20">
          {success ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Senha redefinida!</h2>
              <p className="mt-3 text-sm text-slate-500">
                Sua senha foi alterada com sucesso. Você será redirecionado para o login.
              </p>
              <div className="mt-4 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
              </div>
            </div>
          ) : (
            <>
              <h1 className="mb-1 text-xl font-bold text-slate-900">Redefinir senha</h1>
              <p className="mb-6 text-sm text-slate-500">Crie uma nova senha segura para sua conta</p>

              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <X className="h-4 w-4 text-red-600" />
                  </div>
                  <p className="text-sm font-medium text-red-700">{error}</p>
                  <button onClick={() => setError('')} className="ml-auto shrink-0 text-red-400 hover:text-red-600">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Nova senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-slate-700">
                    Confirmar nova senha
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-12 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                      placeholder="Repita a nova senha"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:from-amber-600 hover:to-orange-700 hover:shadow-xl hover:shadow-amber-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Redefinir senha'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-slate-500/60">
          © 2024 Sauna e Espaço da Janice. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

export default function ResetSenhaPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    }>
      <ResetSenhaForm />
    </Suspense>
  );
}
