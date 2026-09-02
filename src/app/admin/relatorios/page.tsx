'use client';

import { useState } from 'react';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  Loader2, BarChart3, FileText, Package, Warehouse, ShoppingCart, CreditCard,
  FileOutput, DollarSign, AlertCircle, X, Download, Search,
} from 'lucide-react';

type ReportType = 'vendas' | 'produtos' | 'estoque' | 'comandas' | 'pagamentos' | 'despesas' | 'financeiro';

const REPORT_TYPES: { key: ReportType; label: string; icon: typeof BarChart3 }[] = [
  { key: 'vendas', label: 'Vendas', icon: FileOutput },
  { key: 'produtos', label: 'Produtos', icon: Package },
  { key: 'estoque', label: 'Estoque', icon: Warehouse },
  { key: 'comandas', label: 'Comandas', icon: ShoppingCart },
  { key: 'pagamentos', label: 'Pagamentos', icon: CreditCard },
  { key: 'despesas', label: 'Despesas', icon: FileText },
  { key: 'financeiro', label: 'Financeiro', icon: DollarSign },
];

export default function RelatoriosPage() {
  const [reportType, setReportType] = useState<ReportType>('vendas');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reportData, setReportData] = useState<any>(null);

  const fetchReport = async (type: ReportType) => {
    setLoading(true);
    setError('');
    setReportData(null);
    setReportType(type);
    try {
      if (type === 'vendas' || type === 'financeiro') {
        let url = '/api/financial?period=month';
        if (startDate && endDate) {
          url = `/api/financial?period=custom&startDate=${startDate}&endDate=${endDate}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error('Erro ao gerar relatório');
        setReportData(await res.json());
      } else if (type === 'comandas' || type === 'pagamentos') {
        let url = '/api/orders?status=PAGA&status=FECHADA';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Erro ao gerar relatório');
        let data = await res.json();
        if (startDate) data = data.filter((o: any) => o.closedAt && new Date(o.closedAt) >= new Date(startDate));
        if (endDate) {
          const end = new Date(endDate); end.setHours(23, 59, 59, 999);
          data = data.filter((o: any) => o.closedAt && new Date(o.closedAt) <= end);
        }
        setReportData(data);
      } else if (type === 'produtos') {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Erro ao gerar relatório');
        setReportData(await res.json());
      } else if (type === 'estoque') {
        const res = await fetch('/api/inventory');
        if (!res.ok) throw new Error('Erro ao gerar relatório');
        let data = await res.json();
        if (startDate) data = data.filter((i: any) => new Date(i.createdAt) >= new Date(startDate));
        if (endDate) {
          const end = new Date(endDate); end.setHours(23, 59, 59, 999);
          data = data.filter((i: any) => new Date(i.createdAt) <= end);
        }
        setReportData(data);
      } else if (type === 'despesas') {
        let url = '/api/expenses';
        const params: string[] = [];
        if (startDate) params.push(`startDate=${startDate}`);
        if (endDate) params.push(`endDate=${endDate}`);
        if (params.length) url += `?${params.join('&')}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Erro ao gerar relatório');
        setReportData(await res.json());
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    alert('Exportação em breve');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Relatórios</h1>
          <p className="text-sm text-dark-400">Gere relatórios detalhados</p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-600/30 bg-red-600/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto"><X className="h-4 w-4" /></button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {REPORT_TYPES.map((rt) => {
          const Icon = rt.icon;
          return (
            <button
              key={rt.key}
              onClick={() => fetchReport(rt.key)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                reportType === rt.key
                  ? 'border-gold-600 bg-gold-600/10 text-gold-500'
                  : 'border-dark-800 bg-dark-900 text-dark-400 hover:border-dark-700 hover:text-white'
              }`}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{rt.label}</span>
            </button>
          );
        })}
      </div>

      <div className="card">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="label">Data Início</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input w-auto" />
          </div>
          <div>
            <label className="label">Data Fim</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input w-auto" />
          </div>
          <button onClick={() => fetchReport(reportType)} disabled={loading} className="btn-gold">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Gerar Relatório
          </button>
          {reportData && (
            <button onClick={handleExport} className="btn-outline">
              <Download className="h-4 w-4" /> Exportar
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gold-500" />
        </div>
      )}

      {!loading && reportData && (reportType === 'vendas' || reportType === 'financeiro') && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="stat-card">
              <p className="text-xs font-medium text-dark-400">Receitas</p>
              <p className="mt-1 text-2xl font-bold text-green-400">{formatCurrency(reportData.totalRevenue)}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs font-medium text-dark-400">Custos</p>
              <p className="mt-1 text-2xl font-bold text-red-400">{formatCurrency(reportData.totalCosts)}</p>
            </div>
            <div className="stat-card">
              <p className="text-xs font-medium text-dark-400">Lucro Líquido</p>
              <p className={`mt-1 text-2xl font-bold ${reportData.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(reportData.netProfit)}
              </p>
            </div>
          </div>
        </div>
      )}

      {!loading && reportData && reportType === 'comandas' && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dark-800 text-dark-400">
                <th className="px-4 py-3 font-medium">#</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Fechada</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((o: any) => (
                <tr key={o.id} className="table-row">
                  <td className="px-4 py-3 font-medium text-white">#{o.orderNumber}</td>
                  <td className="px-4 py-3 text-dark-300">{o.customer?.name || '—'}</td>
                  <td className="px-4 py-3"><span className={o.status === 'FECHADA' ? 'badge-green' : 'badge-gold'}>{o.status}</span></td>
                  <td className="px-4 py-3 text-dark-400">{o.closedAt ? formatDate(o.closedAt) : '—'}</td>
                  <td className="px-4 py-3 text-right font-medium text-gold-400">{formatCurrency(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && reportData && reportType === 'pagamentos' && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dark-800 text-dark-400">
                <th className="px-4 py-3 font-medium">Comanda</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Método</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {reportData.flatMap((o: any) =>
                (o.payments || []).map((p: any) => (
                  <tr key={p.id} className="table-row">
                    <td className="px-4 py-3 font-medium text-white">#{o.orderNumber}</td>
                    <td className="px-4 py-3 text-dark-300">{o.customer?.name || '—'}</td>
                    <td className="px-4 py-3"><span className="badge-gold">{p.method}</span></td>
                    <td className="px-4 py-3 text-dark-400">{formatDateTime(p.createdAt)}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-400">{formatCurrency(p.amount)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && reportData && reportType === 'produtos' && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dark-800 text-dark-400">
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Categoria</th>
                <th className="px-4 py-3 font-medium text-right">Preço</th>
                <th className="px-4 py-3 font-medium text-right">Estoque</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((p: any) => (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{p.name}</p>
                    {p.code && <p className="text-xs text-dark-500">{p.code}</p>}
                  </td>
                  <td className="px-4 py-3 text-dark-300 hidden sm:table-cell">{p.category?.name || '—'}</td>
                  <td className="px-4 py-3 text-right text-gold-400">{formatCurrency(p.price)}</td>
                  <td className="px-4 py-3 text-right text-dark-300">{p.stock} {p.unit}</td>
                  <td className="px-4 py-3">
                    {p.active ? <span className="badge-green">Ativo</span> : <span className="badge-red">Inativo</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && reportData && reportType === 'estoque' && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dark-800 text-dark-400">
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium text-right">Quantidade</th>
                <th className="px-4 py-3 font-medium">Referência</th>
                <th className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((i: any) => (
                <tr key={i.id} className="table-row">
                  <td className="px-4 py-3 font-medium text-white">{i.product?.name || '—'}</td>
                  <td className="px-4 py-3"><span className="badge-gold">{i.type}</span></td>
                  <td className="px-4 py-3 text-right text-dark-300">{i.quantity}</td>
                  <td className="px-4 py-3 text-dark-400">{i.reference || '—'}</td>
                  <td className="px-4 py-3 text-dark-400">{formatDateTime(i.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && reportData && reportType === 'despesas' && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-dark-800 text-dark-400">
                <th className="px-4 py-3 font-medium">Descrição</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Categoria</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Pagamento</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((e: any) => (
                <tr key={e.id} className="table-row">
                  <td className="px-4 py-3 font-medium text-white">{e.description}</td>
                  <td className="px-4 py-3 hidden sm:table-cell"><span className="badge-gold">{e.category}</span></td>
                  <td className="px-4 py-3 text-dark-300 hidden md:table-cell">{e.paymentMethod}</td>
                  <td className="px-4 py-3 text-dark-400">{formatDate(e.date)}</td>
                  <td className="px-4 py-3 text-right font-medium text-red-400">{formatCurrency(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !reportData && (
        <div className="card flex flex-col items-center py-12">
          <BarChart3 className="mb-3 h-10 w-10 text-dark-600" />
          <p className="text-sm text-dark-500">Selecione um tipo de relatório</p>
        </div>
      )}
    </div>
  );
}
