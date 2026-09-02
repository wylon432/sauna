'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatCurrency, formatDateTime, timeAgo, PAYMENT_METHODS, ORDER_STATUSES } from '@/lib/utils';
import {
  Loader2, Plus, ShoppingCart, X, Search, Trash2, CreditCard, Package,
  CheckCircle2, XCircle, ChevronDown, ChevronUp, Clock, User, FileText,
  AlertCircle, Minus, StickyNote,
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  subtotal: number;
  discount: number;
  addition: number;
  total: number;
  notes: string | null;
  createdAt: string;
  closedAt: string | null;
  customer: { id: string; name: string } | null;
  user: { id: string; name: string };
  items: OrderItem[];
  payments: Payment[];
  manualCharges: ManualCharge[];
}

interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  product: { id: string; name: string; unit: string };
}

interface Payment {
  id: string;
  method: string;
  amount: number;
  notes: string | null;
  createdAt: string;
}

interface ManualCharge {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  unit: string;
  code: string | null;
}

const STATUS_STYLE: Record<string, string> = {
  ABERTA: 'badge-blue',
  PENDENTE: 'badge-yellow',
  PAGA: 'badge-green',
  FECHADA: 'badge-green',
  CANCELADA: 'badge-red',
};

export default function ComandasPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [creating, setCreating] = useState(false);

  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showAddCharge, setShowAddCharge] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [addQty, setAddQty] = useState(1);
  const [addingItem, setAddingItem] = useState(false);

  const [payMethod, setPayMethod] = useState('PIX');
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [addingPayment, setAddingPayment] = useState(false);

  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeQty, setChargeQty] = useState(1);
  const [chargePrice, setChargePrice] = useState('');
  const [addingCharge, setAddingCharge] = useState(false);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    items: true,
    charges: true,
    payments: true,
    totals: true,
  });

  const fetchOrders = useCallback(async () => {
    try {
      const url = statusFilter ? `/api/orders?status=${statusFilter}` : '/api/orders';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro ao carregar comandas');
      const data = await res.json();
      setOrders(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const fetchOrderDetail = async (id: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) throw new Error('Erro ao carregar detalhes');
      const data = await res.json();
      setSelectedOrder(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const createOrder = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao criar comanda');
      }
      const order = await res.json();
      fetchOrders();
      fetchOrderDetail(order.id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products?active=true');
      if (!res.ok) throw new Error('Erro ao carregar produtos');
      const data = await res.json();
      setProducts(data);
    } catch { }
  };

  const addItem = async () => {
    if (!selectedOrder || !selectedProduct) return;
    setAddingItem(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct.id, quantity: addQty }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao adicionar item');
      }
      await fetchOrderDetail(selectedOrder.id);
      setShowAddItem(false);
      setSelectedProduct(null);
      setProductSearch('');
      setAddQty(1);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAddingItem(false);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!selectedOrder) return;
    if (!window.confirm('Remover este item?')) return;
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/items`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao remover item');
      }
      await fetchOrderDetail(selectedOrder.id);
    } catch (e: any) {
      setError(e.message);
    }
  };

  const addPayment = async () => {
    if (!selectedOrder) return;
    const amount = Math.round(parseFloat(payAmount.replace(',', '.')) * 100);
    if (!amount || amount <= 0) {
      setError('Informe um valor válido');
      return;
    }
    setAddingPayment(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: payMethod, amount, notes: payNotes || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao adicionar pagamento');
      }
      await fetchOrderDetail(selectedOrder.id);
      setShowAddPayment(false);
      setPayAmount('');
      setPayNotes('');
      setPayMethod('PIX');
      fetchOrders();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAddingPayment(false);
    }
  };

  const addCharge = async () => {
    if (!selectedOrder) return;
    if (!chargeDesc.trim()) {
      setError('Informe a descrição do encargo');
      return;
    }
    const unitPrice = Math.round(parseFloat(chargePrice.replace(',', '.')) * 100);
    if (!unitPrice || unitPrice <= 0) {
      setError('Informe um valor válido');
      return;
    }
    setAddingCharge(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: selectedOrder.notes
            ? `${selectedOrder.notes}\n[ENCARGO] ${chargeDesc.trim()} x${chargeQty} @ ${formatCurrency(unitPrice)}`
            : `[ENCARGO] ${chargeDesc.trim()} x${chargeQty} @ ${formatCurrency(unitPrice)}`,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao adicionar encargo');
      }
      await fetchOrderDetail(selectedOrder.id);
      setShowAddCharge(false);
      setChargeDesc('');
      setChargeQty(1);
      setChargePrice('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setAddingCharge(false);
    }
  };

  const closeOrder = async () => {
    if (!selectedOrder) return;
    if (!window.confirm('Fechar esta comanda?')) return;
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}/close`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao fechar comanda');
      }
      await fetchOrderDetail(selectedOrder.id);
      fetchOrders();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const cancelOrder = async () => {
    if (!selectedOrder) return;
    if (!window.confirm('Cancelar esta comanda? Itens serão devolvidos ao estoque.')) return;
    try {
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELADA' }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao cancelar comanda');
      }
      await fetchOrderDetail(selectedOrder.id);
      fetchOrders();
    } catch (e: any) {
      setError(e.message);
    }
  };

  const totalPaid = selectedOrder
    ? selectedOrder.payments.reduce((sum, p) => sum + p.amount, 0)
    : 0;
  const remaining = selectedOrder ? selectedOrder.total - totalPaid : 0;
  const canClose = selectedOrder && selectedOrder.items.length > 0 && remaining <= 0 && !['FECHADA', 'CANCELADA'].includes(selectedOrder.status);
  const isOpen = selectedOrder && !['FECHADA', 'CANCELADA'].includes(selectedOrder.status);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.code && p.code.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Comandas</h1>
          <p className="text-sm text-dark-400">{orders.length} comanda(s)</p>
        </div>
        <button onClick={createOrder} disabled={creating} className="btn-gold">
          {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          NOVA COMANDA
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-600/30 bg-red-600/10 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setStatusFilter('')}
          className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
            statusFilter === '' ? 'bg-gold-600 text-dark-950' : 'bg-dark-800 text-dark-300 hover:text-white'
          }`}
        >
          Todas
        </button>
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === s ? 'bg-gold-600 text-dark-950' : 'bg-dark-800 text-dark-300 hover:text-white'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
        </div>
      ) : orders.length === 0 ? (
        <div className="card flex flex-col items-center py-12">
          <ShoppingCart className="mb-3 h-10 w-10 text-dark-600" />
          <p className="text-sm text-dark-500">Nenhuma comanda encontrada</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order) => {
            const orderPaid = order.payments.reduce((s, p) => s + p.amount, 0);
            return (
              <button
                key={order.id}
                onClick={() => fetchOrderDetail(order.id)}
                className="w-full rounded-xl border border-dark-800 bg-dark-900 p-4 text-left transition-colors hover:border-dark-700 hover:bg-dark-850"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-dark-800 text-sm font-bold text-gold-400">
                      #{order.orderNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={STATUS_STYLE[order.status] || 'badge-gray'}>{order.status}</span>
                        <span className="text-xs text-dark-500">{timeAgo(order.createdAt)}</span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-dark-300">
                        {order.customer ? (
                          <><User className="h-3 w-3" /> {order.customer.name}</>
                        ) : (
                          <span className="text-dark-500">Sem cliente</span>
                        )}
                        <span className="text-dark-600">·</span>
                        <span>{order.items.length} item(s)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gold-400">{formatCurrency(order.total)}</p>
                    {order.total > 0 && (
                      <p className="text-xs text-dark-500">
                        Pago: {formatCurrency(orderPaid)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 p-0 pt-4 sm:p-4 sm:pt-8">
          <div className="w-full max-w-2xl rounded-xl bg-dark-900 border border-dark-800 sm:my-8">
            {loadingDetail ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-dark-800 p-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-white">#{selectedOrder.orderNumber}</h2>
                    <span className={STATUS_STYLE[selectedOrder.status] || 'badge-gray'}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="rounded-lg p-2 text-dark-400 hover:text-white">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-dark-500">Cliente</span>
                      <p className="font-medium text-white">{selectedOrder.customer?.name || '—'}</p>
                    </div>
                    <div>
                      <span className="text-dark-500">Criada</span>
                      <p className="font-medium text-white">{formatDateTime(selectedOrder.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-dark-500">Atendente</span>
                      <p className="font-medium text-white">{selectedOrder.user.name}</p>
                    </div>
                    {selectedOrder.closedAt && (
                      <div>
                        <span className="text-dark-500">Fechada</span>
                        <p className="font-medium text-white">{formatDateTime(selectedOrder.closedAt)}</p>
                      </div>
                    )}
                  </div>

                  {selectedOrder.notes && (
                    <div className="rounded-lg bg-dark-800 p-3">
                      <div className="flex items-center gap-1 text-xs text-dark-400 mb-1">
                        <StickyNote className="h-3 w-3" /> Observações
                      </div>
                      <p className="text-sm text-dark-200 whitespace-pre-wrap">{selectedOrder.notes}</p>
                    </div>
                  )}

                  <div className="border-t border-dark-800 pt-4">
                    <button
                      onClick={() => setExpandedSections((p) => ({ ...p, items: !p.items }))}
                      className="flex w-full items-center justify-between"
                    >
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <Package className="h-4 w-4 text-gold-500" />
                        Itens ({selectedOrder.items.length})
                      </h3>
                      {expandedSections.items ? <ChevronUp className="h-4 w-4 text-dark-400" /> : <ChevronDown className="h-4 w-4 text-dark-400" />}
                    </button>
                    {expandedSections.items && (
                      <div className="mt-3">
                        {selectedOrder.items.length === 0 ? (
                          <p className="py-4 text-center text-sm text-dark-500">Nenhum item</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedOrder.items.map((item) => (
                              <div key={item.id} className="flex items-center justify-between rounded-lg bg-dark-800 p-3">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{item.product.name}</p>
                                  <p className="text-xs text-dark-400">
                                    {item.quantity} {item.product.unit} × {formatCurrency(item.unitPrice)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 ml-3">
                                  <span className="text-sm font-medium text-gold-400">{formatCurrency(item.total)}</span>
                                  {isOpen && (
                                    <button onClick={() => removeItem(item.id)} className="rounded p-1 text-dark-500 hover:text-red-400">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {isOpen && (
                          <button onClick={() => { setShowAddItem(true); loadProducts(); }} className="btn-outline mt-3 w-full text-xs py-2">
                            <Plus className="h-3.5 w-3.5" /> Adicionar Item
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedOrder.manualCharges.length > 0 && (
                    <div className="border-t border-dark-800 pt-4">
                      <button
                        onClick={() => setExpandedSections((p) => ({ ...p, charges: !p.charges }))}
                        className="flex w-full items-center justify-between"
                      >
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gold-500" />
                          Encargos Manuais ({selectedOrder.manualCharges.length})
                        </h3>
                        {expandedSections.charges ? <ChevronUp className="h-4 w-4 text-dark-400" /> : <ChevronDown className="h-4 w-4 text-dark-400" />}
                      </button>
                      {expandedSections.charges && (
                        <div className="mt-3 space-y-2">
                          {selectedOrder.manualCharges.map((ch) => (
                            <div key={ch.id} className="flex items-center justify-between rounded-lg bg-dark-800 p-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{ch.description}</p>
                                <p className="text-xs text-dark-400">{ch.quantity} × {formatCurrency(ch.unitPrice)}</p>
                              </div>
                              <span className="text-sm font-medium text-gold-400 ml-3">{formatCurrency(ch.total)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {isOpen && (
                    <button onClick={() => setShowAddCharge(true)} className="btn-outline w-full text-xs py-2">
                      <Plus className="h-3.5 w-3.5" /> Adicionar Encargo Manual
                    </button>
                  )}

                  <div className="border-t border-dark-800 pt-4">
                    <button
                      onClick={() => setExpandedSections((p) => ({ ...p, payments: !p.payments }))}
                      className="flex w-full items-center justify-between"
                    >
                      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-gold-500" />
                        Pagamentos ({selectedOrder.payments.length})
                      </h3>
                      {expandedSections.payments ? <ChevronUp className="h-4 w-4 text-dark-400" /> : <ChevronDown className="h-4 w-4 text-dark-400" />}
                    </button>
                    {expandedSections.payments && (
                      <div className="mt-3">
                        {selectedOrder.payments.length === 0 ? (
                          <p className="py-4 text-center text-sm text-dark-500">Nenhum pagamento</p>
                        ) : (
                          <div className="space-y-2">
                            {selectedOrder.payments.map((pay) => (
                              <div key={pay.id} className="flex items-center justify-between rounded-lg bg-dark-800 p-3">
                                <div>
                                  <p className="text-sm font-medium text-white">{pay.method}</p>
                                  {pay.notes && <p className="text-xs text-dark-400">{pay.notes}</p>}
                                  <p className="text-xs text-dark-500">{formatDateTime(pay.createdAt)}</p>
                                </div>
                                <span className="text-sm font-medium text-green-400">{formatCurrency(pay.amount)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {isOpen && (
                          <button onClick={() => setShowAddPayment(true)} className="btn-outline mt-3 w-full text-xs py-2">
                            <CreditCard className="h-3.5 w-3.5" /> Adicionar Pagamento
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-dark-800 pt-4">
                    <button
                      onClick={() => setExpandedSections((p) => ({ ...p, totals: !p.totals }))}
                      className="flex w-full items-center justify-between"
                    >
                      <h3 className="text-sm font-semibold text-white">Totais</h3>
                      {expandedSections.totals ? <ChevronUp className="h-4 w-4 text-dark-400" /> : <ChevronDown className="h-4 w-4 text-dark-400" />}
                    </button>
                    {expandedSections.totals && (
                      <div className="mt-3 space-y-2 rounded-lg bg-dark-800 p-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-dark-400">Subtotal</span>
                          <span className="text-white">{formatCurrency(selectedOrder.subtotal)}</span>
                        </div>
                        {selectedOrder.discount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-dark-400">Desconto</span>
                            <span className="text-red-400">-{formatCurrency(selectedOrder.discount)}</span>
                          </div>
                        )}
                        {selectedOrder.addition > 0 && (
                          <div className="flex justify-between">
                            <span className="text-dark-400">Acréscimo</span>
                            <span className="text-green-400">+{formatCurrency(selectedOrder.addition)}</span>
                          </div>
                        )}
                        <div className="flex justify-between border-t border-dark-700 pt-2">
                          <span className="font-semibold text-white">Total</span>
                          <span className="font-bold text-gold-400 text-base">{formatCurrency(selectedOrder.total)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-400">Pago</span>
                          <span className="text-green-400">{formatCurrency(totalPaid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-dark-400">Restante</span>
                          <span className={remaining > 0 ? 'text-red-400 font-semibold' : 'text-green-400'}>
                            {formatCurrency(remaining)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div className="flex gap-3 border-t border-dark-800 p-4">
                    {canClose ? (
                      <button onClick={closeOrder} className="btn-gold flex-1">
                        <CheckCircle2 className="h-4 w-4" /> Fechar Comanda
                      </button>
                    ) : (
                      <div className="flex-1 rounded-lg border border-dark-700 bg-dark-800 p-2 text-center text-xs text-dark-500">
                        {selectedOrder.items.length === 0 ? 'Adicione itens' : remaining > 0 ? `Restante: ${formatCurrency(remaining)}` : ''}
                      </div>
                    )}
                    {selectedOrder.status !== 'CANCELADA' && (
                      <button onClick={cancelOrder} className="btn-danger px-4">
                        <XCircle className="h-4 w-4" /> Cancelar
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {showAddItem && selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-xl bg-dark-900 border border-dark-800 sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-dark-800 p-4">
              <h3 className="text-sm font-semibold text-white">Adicionar Item</h3>
              <button onClick={() => { setShowAddItem(false); setSelectedProduct(null); setProductSearch(''); }} className="rounded p-1 text-dark-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {!selectedProduct ? (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-500" />
                    <input
                      type="text"
                      placeholder="Buscar produto..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="input pl-10"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredProducts.length === 0 ? (
                      <p className="py-4 text-center text-sm text-dark-500">Nenhum produto encontrado</p>
                    ) : (
                      filteredProducts.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedProduct(p)}
                          className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-dark-800"
                        >
                          <div>
                            <p className="text-sm font-medium text-white">{p.name}</p>
                            <p className="text-xs text-dark-400">
                              {formatCurrency(p.price)} · Estoque: {p.stock} {p.unit}
                            </p>
                          </div>
                          {p.code && <span className="text-xs text-dark-500">{p.code}</span>}
                        </button>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-lg bg-dark-800 p-3">
                    <p className="text-sm font-medium text-white">{selectedProduct.name}</p>
                    <p className="text-xs text-dark-400">
                      {formatCurrency(selectedProduct.price)} · Estoque: {selectedProduct.stock} {selectedProduct.unit}
                    </p>
                  </div>
                  <div>
                    <label className="label">Quantidade</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setAddQty(Math.max(1, addQty - 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-dark-800 text-white hover:bg-dark-700"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        value={addQty}
                        onChange={(e) => setAddQty(Math.max(1, parseInt(e.target.value) || 1))}
                        className="input w-20 text-center"
                        min={1}
                      />
                      <button
                        onClick={() => setAddQty(addQty + 1)}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-dark-800 text-white hover:bg-dark-700"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="rounded-lg bg-dark-800 p-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-dark-400">Subtotal</span>
                      <span className="font-bold text-gold-400">
                        {formatCurrency(selectedProduct.price * addQty)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setSelectedProduct(null); setProductSearch(''); setAddQty(1); }} className="btn-outline flex-1">
                      Voltar
                    </button>
                    <button onClick={addItem} disabled={addingItem || addQty > selectedProduct.stock} className="btn-gold flex-1">
                      {addingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                      Adicionar
                    </button>
                  </div>
                  {addQty > selectedProduct.stock && (
                    <p className="text-xs text-center text-red-400">Estoque insuficiente</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showAddPayment && selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-xl bg-dark-900 border border-dark-800 sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-dark-800 p-4">
              <h3 className="text-sm font-semibold text-white">Adicionar Pagamento</h3>
              <button onClick={() => { setShowAddPayment(false); setPayAmount(''); setPayNotes(''); }} className="rounded p-1 text-dark-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="label">Forma de Pagamento</label>
                <select value={payMethod} onChange={(e) => setPayMethod(e.target.value)} className="select">
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Valor (R$)</label>
                <input
                  type="text"
                  placeholder="0,00"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="input"
                  autoFocus
                />
                {remaining > 0 && (
                  <button
                    onClick={() => setPayAmount((remaining / 100).toFixed(2).replace('.', ','))}
                    className="mt-1 text-xs text-gold-500 hover:text-gold-400"
                  >
                    Pagar saldo restante: {formatCurrency(remaining)}
                  </button>
                )}
              </div>
              <div>
                <label className="label">Observações</label>
                <input
                  type="text"
                  placeholder="Opcional"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="input"
                />
              </div>
              <button onClick={addPayment} disabled={addingPayment || !payAmount} className="btn-gold w-full">
                {addingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddCharge && selectedOrder && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-xl bg-dark-900 border border-dark-800 sm:rounded-xl">
            <div className="flex items-center justify-between border-b border-dark-800 p-4">
              <h3 className="text-sm font-semibold text-white">Encargo Manual</h3>
              <button onClick={() => { setShowAddCharge(false); setChargeDesc(''); setChargePrice(''); setChargeQty(1); }} className="rounded p-1 text-dark-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="label">Descrição</label>
                <input
                  type="text"
                  placeholder="Ex: Serviço extra, Taxa..."
                  value={chargeDesc}
                  onChange={(e) => setChargeDesc(e.target.value)}
                  className="input"
                  autoFocus
                />
              </div>
              <div>
                <label className="label">Quantidade</label>
                <input
                  type="number"
                  value={chargeQty}
                  onChange={(e) => setChargeQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="input"
                  min={1}
                />
              </div>
              <div>
                <label className="label">Valor Unitário (R$)</label>
                <input
                  type="text"
                  placeholder="0,00"
                  value={chargePrice}
                  onChange={(e) => setChargePrice(e.target.value)}
                  className="input"
                />
              </div>
              {chargeQty > 0 && parseFloat(chargePrice.replace(',', '.')) > 0 && (
                <div className="rounded-lg bg-dark-800 p-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-400">Total</span>
                    <span className="font-bold text-gold-400">
                      {formatCurrency(Math.round(parseFloat(chargePrice.replace(',', '.')) * 100) * chargeQty)}
                    </span>
                  </div>
                </div>
              )}
              <button onClick={addCharge} disabled={addingCharge} className="btn-gold w-full">
                {addingCharge ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Adicionar Encargo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
