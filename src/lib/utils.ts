import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function parseCurrencyToCents(value: string): number {
  const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
  return Math.round(parseFloat(cleaned || '0') * 100);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}

export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(date));
}

export function timeAgo(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return formatDate(date);
}

export const PAYMENT_METHODS = [
  { value: 'PIX', label: 'PIX' },
  { value: 'DINHEIRO', label: 'Dinheiro' },
  { value: 'DEBITO', label: 'Débito' },
  { value: 'CREDITO', label: 'Crédito' },
  { value: 'OUTRO', label: 'Outro' },
];

export const EXPENSE_CATEGORIES = [
  'Energia', 'Água', 'Funcionários', 'Limpeza', 'Manutenção',
  'Compras', 'Fornecedores', 'Marketing', 'Impostos', 'Outros',
];

export const ORDER_STATUSES = ['ABERTA', 'PENDENTE', 'FECHADA', 'CANCELADA'];

export const INVENTORY_TYPES = ['ENTRADA', 'VENDA', 'AJUSTE', 'PERDA', 'ESTORNO'];
