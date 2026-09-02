'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  Loader2, Settings, Save, Lock, Store, Phone, MapPin, AlertCircle, X, CheckCircle2,
} from 'lucide-react';

export default function ConfiguracoesPage() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.ok ? r.json() : {})
      .then((data: Record<string, string>) => {
        setBusinessName(data.businessName || '');
        setBusinessPhone(data.businessPhone || '');
        setBusinessAddress(data.businessAddress || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveBusiness = async () => {
    setSavingBusiness(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, businessPhone, businessAddress }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao salvar');
      }
      setSuccess('Dados do negócio salvos com sucesso');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSavingBusiness(false);
    }
  };

  const savePassword = async () => {
    const errs: Record<string, string> = {};
    if (!currentPassword) errs.currentPassword = 'Senha atual é obrigatória';
    if (!newPassword || newPassword.length < 6) errs.newPassword = 'Senha deve ter pelo menos 6 caracteres';
    if (newPassword !== confirmPassword) errs.confirmPassword = 'Senhas não conferem';
    setPwErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSavingPassword(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao alterar senha');
      }
      setSuccess('Senha alterada com sucesso');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Configurações</h1>
        <p className="text-sm text-dark-400">Gerencie as configurações do sistema</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-600/30 bg-red-600/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-600/30 bg-green-600/10 p-3 text-sm text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <Store className="h-4 w-4 text-gold-500" />
          <h2 className="text-sm font-semibold text-white">Dados do Negócio</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="label">
              <span className="flex items-center gap-1.5"><Store className="h-3 w-3" /> Nome do Estabelecimento</span>
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="input"
              placeholder="Nome do estabelecimento"
            />
          </div>
          <div>
            <label className="label">
              <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> Telefone</span>
            </label>
            <input
              type="text"
              value={businessPhone}
              onChange={(e) => setBusinessPhone(e.target.value)}
              className="input"
              placeholder="(00) 00000-0000"
            />
          </div>
          <div>
            <label className="label">
              <span className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> Endereço</span>
            </label>
            <input
              type="text"
              value={businessAddress}
              onChange={(e) => setBusinessAddress(e.target.value)}
              className="input"
              placeholder="Endereço completo"
            />
          </div>
          <button onClick={saveBusiness} disabled={savingBusiness} className="btn-gold">
            {savingBusiness ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Dados
          </button>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-4 w-4 text-gold-500" />
          <h2 className="text-sm font-semibold text-white">Alterar Senha</h2>
        </div>
        <div className="space-y-3">
          <div>
            <label className="label">Senha Atual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={`input ${pwErrors.currentPassword ? 'border-red-600' : ''}`}
              placeholder="••••••••"
            />
            {pwErrors.currentPassword && <p className="mt-1 text-xs text-red-400">{pwErrors.currentPassword}</p>}
          </div>
          <div>
            <label className="label">Nova Senha</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={`input ${pwErrors.newPassword ? 'border-red-600' : ''}`}
              placeholder="••••••••"
            />
            {pwErrors.newPassword && <p className="mt-1 text-xs text-red-400">{pwErrors.newPassword}</p>}
          </div>
          <div>
            <label className="label">Confirmar Nova Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`input ${pwErrors.confirmPassword ? 'border-red-600' : ''}`}
              placeholder="••••••••"
            />
            {pwErrors.confirmPassword && <p className="mt-1 text-xs text-red-400">{pwErrors.confirmPassword}</p>}
          </div>
          <button onClick={savePassword} disabled={savingPassword} className="btn-gold">
            {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Alterar Senha
          </button>
        </div>
      </div>
    </div>
  );
}
