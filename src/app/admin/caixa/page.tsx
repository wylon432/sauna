'use client';

import { useState, useEffect } from 'react';
import { formatCurrency, formatDateTime, timeAgo } from '@/lib/utils';
import {
  Loader2, DollarSign, X, AlertCircle, Lock, Unlock, TrendingUp, TrendingDown,
  ArrowDownCircle, ArrowUpCircle, RefreshCw,
} from 'lucide-react';

interface CashMovement {
  id: string;
  type: string;
  amount: number;
  description: string | null;
  createdAt: string;
  user: { id: string; name: string };
  order?: { id: string; orderNumber: number } | null;
}

interface CashRegister {
  id: string;
  status: string;
  initialValue: number;
  finalValue: number | null;
  expectedValue: number | null;
  difference: number | null;
  openedAt: string;
  closedAt: string | null;
  user: { id: string; name: string };
  closedBy?: { id: string; name: string } | null;
  movements: CashMovement[];
}

interface RegisterData {
  open: CashRegister | null;
  recentClosed: CashRegister[];
}

const MOVEMENT_LABELS: Record<string, { label: string; color: string; icon: typeof TrendingUp }> = {
  VENDA: { label: 'Venda', color: 'text-green-400', icon: TrendingUp },
  SUPRIMENTO: { label: 'Suprimento', color: 'text-blue-400', icon: ArrowDownCircle },
  ENTRADA: { label: 'Entrada', color: 'text-blue-400', icon: ArrowDownCircle },
  DESPESA: { label: 'Despesa', color: 'text-red-400', icon: TrendingDown },
  RETIRADA: { label: 'Retirada', color: 'text-red-400', icon: ArrowUpCircle },
  SANGRIA: { label: 'Sangria', color: 'text-red-400', icon: ArrowUpCircle },
};

export default function CaixaPage() {
  const [data, setData] = useState<RegisterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showOpenModal, setShowOpenModal] = useState(false);
  const [openValue, setOpenValue] = useState('');
  const [opening, setOpening] = useState(false);

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeValue, setCloseValue] = useState('');
  const [closing, setClosing] = useState(false);

  const fetchRegister = async () => {
    try {
      const res = await fetch('/api/cash-register');
      if (!res.ok) throw new Error('Erro ao carregar caixa');
      const json = await res.json();
      setData(json);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRegister(); }, []);

  const openRegister = async () => {
    const val = Math.round(parseFloat(openValue.replace(',', '.')) * 100);
    if (isNaN(val) || val < 0) {
      setError('Informe um valor válido');
      return;
    }
    setOpening(true);
    setError('');
    try {
      const res = await fetch('/api/cash-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialValue: val }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Erro ao abrir caixa');
      }
      setShowOpenModal(false);
      setOpenValue('');
      await fetchRegister();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setOpening(false);
    }
  };

  const closeRegister = async () => {
    if (!data?.open) return;
    const val = Math.round(parseFloat(closeValue.replace(',', '.')) * 100);
    if (isNaN(val) || val < 0) {
      setError('Informe um valor válido');
      return;
    }
    setClosing(true);
    setError('');
    try {
      const res = await fetch(`/api/cash-register/${data.open.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ finalValue: val }),
      });
      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Erro ao fechar caixa');
      }
      setShowCloseModal(false);
      setCloseValue('');
      await fetchRegister();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setClosing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
      </div>
    );
  }

  const register = data?.open;
  const totalEntradas = register
    ? register.movements
        .filter((m) => ['VENDA', 'SUPRIMENTO', 'ENTRADA'].includes(m.type))
        .reduce((s, m) => s + m.amount, 0)
    : 0;
  const totalSaidas = register
    ? register.movements
        .filter((m) => ['DESPESA', 'RETIRADA', 'SANGRIA'].includes(m.type))
        .reduce((s, m) => s + m.amount, 0)
    : 0;
  const saldo = register ? register.initialValue + totalEntradas - totalSaidas : 0;

  const expectedValue = register ? register.initialValue + totalEntradas - totalSaidas : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Caixa</h1>
          <p className="text-sm text-dark-400">{register ? 'Caixa aberto' : 'Nenhum caixa aberto'}</p>
        </div>
        <div className="flex gap-2">
          {register && (
            <button onClick={() => { setShowCloseModal(true); setCloseValue((expectedValue / 100).toFixed(2).replace('.', ',')); }} className="btn-danger">
              <Lock className="h-4 w-4" /> FECHAR CAIXA
            </button>
          )}
          {!register && (
            <button onClick={() => setShowOpenModal(true)} className="btn-gold">
              <Unlock className="h-4 w-4" /> ABRIR CAIXA
            </button>
          )}
          <button onClick={fetchRegister} className="btn-ghost">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-600/30 bg-red-600/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      {register && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-dark-400">Total Entradas</p>
                  <p className="mt-1 text-2xl font-bold text-green-400">{formatCurrency(totalEntradas)}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600/10">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-dark-400">Total Saídas</p>
                  <p className="mt-1 text-2xl font-bold text-red-400">{formatCurrency(totalSaidas)}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600/10">
                  <TrendingDown className="h-5 w-5 text-red-400" />
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-dark-400">Saldo</p>
                  <p className="mt-1 text-2xl font-bold text-gold-400">{formatCurrency(saldo)}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-600/10">
                  <DollarSign className="h-5 w-5 text-gold-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Detalhes do Caixa</h3>
                <p className="text-xs text-dark-500">Aberto por {register.user.name} em {formatDateTime(register.openedAt)}</p>
              </div>
              <span className="badge-green">ABERTO</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <div>
                <span className="text-dark-500">Valor Inicial</span>
                <p className="font-medium text-white">{formatCurrency(register.initialValue)}</p>
              </div>
              <div>
                <span className="text-dark-500">Movimentos</span>
                <p className="font-medium text-white">{register.movements.length}</p>
              </div>
              <div>
                <span className="text-dark-500">Valor Esperado</span>
                <p className="font-medium text-gold-400">{formatCurrency(expectedValue)}</p>
              </div>
              <div>
                <span className="text-dark-500">Abertura</span>
                <p className="font-medium text-white">{formatDateTime(register.openedAt)}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="mb-4 text-sm font-semibold text-white">Movimentos do Caixa</h3>
            {register.movements.length === 0 ? (
              <div className="py-8 text-center">
                <DollarSign className="mx-auto mb-2 h-8 w-8 text-dark-600" />
                <p className="text-sm text-dark-500">Nenhum movimento registrado</p>
              </div>
            ) : (
              <div className="space-y-2">
                {register.movements.map((m) => {
                  const meta = MOVEMENT_LABELS[m.type] || { label: m.type, color: 'text-dark-400', icon: DollarSign };
                  const Icon = meta.icon;
                  const isIn = ['VENDA', 'SUPRIMENTO', 'ENTRADA'].includes(m.type);
                  return (
                    <div key={m.id} className="flex items-center justify-between rounded-lg bg-dark-800 p-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isIn ? 'bg-green-600/10' : 'bg-red-600/10'}`}>
                          <Icon className={`h-4 w-4 ${meta.color}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{meta.label}</p>
                          <p className="text-xs text-dark-500">
                            {m.description || '—'} · {m.user.name} · {timeAgo(m.createdAt)}
                          </p>
                          {m.order && (
                            <p className="text-xs text-dark-500">Comanda #{m.order.orderNumber}</p>
                          )}
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${isIn ? 'text-green-400' : 'text-red-400'}`}>
                        {isIn ? '+' : '-'}{formatCurrency(m.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {!register && data?.recentClosed && data.recentClosed.length > 0 && (
        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-white">Caixas Anteriores</h3>
          <div className="space-y-2">
            {data.recentClosed.map((cr) => (
              <div key={cr.id} className="flex items-center justify-between rounded-lg bg-dark-800 p-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    {formatDateTime(cr.openedAt)} — {cr.closedAt ? formatDateTime(cr.closedAt) : '—'}
                  </p>
                  <p className="text-xs text-dark-500">
                    Aberto por {cr.user.name} · Fechado por {cr.closedBy?.name || '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gold-400">{formatCurrency(cr.finalValue || 0)}</p>
                  {cr.difference !== null && cr.difference !== 0 && (
                    <p className={`text-xs ${cr.difference > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      Diferença: {formatCurrency(cr.difference)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!register && !loading && (
        <div className="card flex flex-col items-center py-12">
          <DollarSign className="mb-3 h-10 w-10 text-dark-600" />
          <p className="text-sm text-dark-500">Nenhum caixa aberto no momento</p>
          <button onClick={() => setShowOpenModal(true)} className="btn-gold mt-4">
            <Unlock className="h-4 w-4" /> ABRIR CAIXA
          </button>
        </div>
      )}

      {showOpenModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-xl bg-dark-900 border border-dark-800 sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-dark-800 p-4">
              <h3 className="text-sm font-semibold text-white">Abrir Caixa</h3>
              <button onClick={() => setShowOpenModal(false)} className="rounded p-1 text-dark-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="label">Valor Inicial (R$)</label>
                <input
                  type="text"
                  placeholder="0,00"
                  value={openValue}
                  onChange={(e) => setOpenValue(e.target.value)}
                  className="input"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && openRegister()}
                />
              </div>
              <button onClick={openRegister} disabled={opening} className="btn-gold w-full">
                {opening ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
                Abrir Caixa
              </button>
            </div>
          </div>
        </div>
      )}

      {showCloseModal && register && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-xl bg-dark-900 border border-dark-800 sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-dark-800 p-4">
              <h3 className="text-sm font-semibold text-white">Fechar Caixa</h3>
              <button onClick={() => setShowCloseModal(false)} className="rounded p-1 text-dark-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="rounded-lg bg-dark-800 p-3 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-dark-400">Valor Inicial</span>
                  <span className="text-white">{formatCurrency(register.initialValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Entradas</span>
                  <span className="text-green-400">+{formatCurrency(totalEntradas)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Saídas</span>
                  <span className="text-red-400">-{formatCurrency(totalSaidas)}</span>
                </div>
                <div className="flex justify-between border-t border-dark-700 pt-2">
                  <span className="font-semibold text-white">Valor Esperado</span>
                  <span className="font-bold text-gold-400">{formatCurrency(expectedValue)}</span>
                </div>
              </div>
              <div>
                <label className="label">Valor Real em Caixa (R$)</label>
                <input
                  type="text"
                  placeholder="0,00"
                  value={closeValue}
                  onChange={(e) => setCloseValue(e.target.value)}
                  className="input"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && closeRegister()}
                />
                {closeValue && (
                  <div className="mt-2 rounded-lg bg-dark-800 p-2 text-sm">
                    {(() => {
                      const actual = Math.round(parseFloat(closeValue.replace(',', '.')) * 100);
                      const diff = actual - expectedValue;
                      return (
                        <div className="flex justify-between">
                          <span className="text-dark-400">Diferença</span>
                          <span className={diff === 0 ? 'text-green-400' : diff > 0 ? 'text-blue-400' : 'text-red-400'}>
                            {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
              <button onClick={closeRegister} disabled={closing} className="btn-danger w-full">
                {closing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Confirmar Fechamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
