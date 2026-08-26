'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Flame, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou senha incorretos');
        return;
      }

      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();

      if (session?.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/minha-conta');
      }
      router.refresh();
    } catch {
      setError('Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-950 px-4 py-12">
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[20%] top-[30%] h-[400px] w-[400px] rounded-full bg-brand-600/8 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[20%] h-[300px] w-[300px] rounded-full bg-brand-500/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/30 transition-transform group-hover:scale-110">
              <Flame className="h-6 w-6" />
            </div>
          </Link>
          <h1 className="mt-6 text-2xl font-extrabold text-white">Entrar na sua conta</h1>
          <p className="mt-2 text-sm text-dark-400">Acesse suas reservas e gerencie seu perfil</p>
        </div>

        <div className="rounded-3xl border border-dark-800 bg-dark-900/80 p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label text-dark-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-dark-500" />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input border-dark-700 bg-dark-800 pl-12 text-white placeholder:text-dark-500 focus:border-brand-500 focus:ring-brand-500/20"
                  placeholder="seu@email.com" required />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label text-dark-300">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-dark-500" />
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input border-dark-700 bg-dark-800 pl-12 pr-12 text-white placeholder:text-dark-500 focus:border-brand-500 focus:ring-brand-500/20"
                  placeholder="Sua senha" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-dark-500 hover:text-dark-300">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link href="/esqueci-senha" className="text-sm font-semibold text-brand-400 hover:text-brand-300">
                Esqueci minha senha
              </Link>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Entrar'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-dark-700" /></div>
            <div className="relative flex justify-center text-sm"><span className="bg-dark-900 px-4 text-dark-500">ou</span></div>
          </div>

          <p className="text-center text-sm text-dark-500">
            Não tem uma conta?{' '}
            <Link href="/cadastro" className="font-bold text-brand-400 hover:text-brand-300">Criar conta</Link>
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-dark-600">
          &copy; {new Date().getFullYear()} Sauna e Espaço da Janice
        </p>
      </div>
    </div>
  );
}
