'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Flame, Loader2, User, Phone } from 'lucide-react';

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const passwordStrength = (() => {
    const p = form.password;
    if (p.length === 0) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    return Math.min(s, 3);
  })();

  const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['', 'Fraca', 'Média', 'Forte'];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!agreeTerms) { setError('Você precisa concordar com os termos.'); return; }
    if (form.password !== form.confirmPassword) { setError('As senhas não coincidem.'); return; }
    if (form.password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erro ao criar conta.'); return; }

      await signIn('credentials', { email: form.email.toLowerCase(), password: form.password, redirect: false });
      router.push('/minha-conta');
      router.refresh();
    } catch { setError('Erro ao criar conta.'); }
    finally { setLoading(false); }
  }

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-950 px-4 py-12">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[20%] top-[30%] h-[400px] w-[400px] rounded-full bg-brand-600/8 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] h-[300px] w-[300px] rounded-full bg-brand-500/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30">
              <Flame className="h-6 w-6" />
            </div>
          </Link>
          <h1 className="mt-6 text-2xl font-extrabold text-white">Criar sua conta</h1>
          <p className="mt-2 text-sm text-dark-400">Preencha seus dados para começar</p>
        </div>

        <div className="rounded-3xl border border-dark-800 bg-dark-900/80 p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label text-dark-300">Nome completo</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-dark-500" />
                <input type="text" value={form.name} onChange={(e) => update('name', e.target.value)}
                  className="input border-dark-700 bg-dark-800 pl-12 text-white placeholder:text-dark-500 focus:border-brand-500 focus:ring-brand-500/20"
                  placeholder="Seu nome" required />
              </div>
            </div>

            <div>
              <label className="label text-dark-300">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-dark-500" />
                <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)}
                  className="input border-dark-700 bg-dark-800 pl-12 text-white placeholder:text-dark-500 focus:border-brand-500 focus:ring-brand-500/20"
                  placeholder="seu@email.com" required />
              </div>
            </div>

            <div>
              <label className="label text-dark-300">Telefone</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 h-5 w-5 text-dark-500" />
                <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)}
                  className="input border-dark-700 bg-dark-800 pl-12 text-white placeholder:text-dark-500 focus:border-brand-500 focus:ring-brand-500/20"
                  placeholder="(XX) XXXXX-XXXX" />
              </div>
            </div>

            <div>
              <label className="label text-dark-300">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-dark-500" />
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => update('password', e.target.value)}
                  className="input border-dark-700 bg-dark-800 pl-12 pr-12 text-white placeholder:text-dark-500 focus:border-brand-500 focus:ring-brand-500/20"
                  placeholder="Mínimo 6 caracteres" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-dark-500 hover:text-dark-300">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1.5">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-dark-700'}`} />
                    ))}
                  </div>
                  <p className="mt-1 text-xs font-medium text-dark-500">{strengthLabels[passwordStrength]}</p>
                </div>
              )}
            </div>

            <div>
              <label className="label text-dark-300">Confirmar senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-dark-500" />
                <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)}
                  className="input border-dark-700 bg-dark-800 pl-12 pr-12 text-white placeholder:text-dark-500 focus:border-brand-500 focus:ring-brand-500/20"
                  placeholder="Repita a senha" required />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-3.5 text-dark-500 hover:text-dark-300">
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-dark-600 bg-dark-800 text-brand-600 focus:ring-brand-500" />
              <span className="text-sm text-dark-400">
                Li e concordo com os{' '}
                <Link href="/termos" className="font-semibold text-brand-400 hover:text-brand-300">termos e política de privacidade</Link>.
              </span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Criar conta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-500">
            Já tem uma conta?{' '}
            <Link href="/login" className="font-bold text-brand-400 hover:text-brand-300">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
