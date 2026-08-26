export function getWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/55${cleanPhone}?text=${encodedMessage}`;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('pt-BR');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export const RESERVATION_STATUS: Record<string, { label: string; color: string }> = {
  REQUESTED: { label: 'Solicitada', color: 'bg-yellow-100 text-yellow-800' },
  PRE_RESERVED: { label: 'Pré-reserva', color: 'bg-orange-100 text-orange-800' },
  AWAITING_SIGNAL: { label: 'Aguardando Sinal', color: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { label: 'Confirmada', color: 'bg-green-100 text-green-800' },
  PARTIAL_PAYMENT: { label: 'Pagamento Parcial', color: 'bg-blue-100 text-blue-800' },
  FULL_PAYMENT: { label: 'Pagamento Completo', color: 'bg-emerald-100 text-emerald-800' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
  COMPLETED: { label: 'Concluída', color: 'bg-gray-100 text-gray-800' },
};

export const SAUNA_STATUS: Record<string, { label: string; color: string }> = {
  CONFIRMED: { label: 'Confirmada', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
  COMPLETED: { label: 'Concluída', color: 'bg-gray-100 text-gray-800' },
};

export const GENDERS: Record<string, string> = {
  FEMININO: 'Feminino',
  MASCULINO: 'Masculino',
};

export const DAYS_OF_WEEK = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const GALLERY_CATEGORIES = ['SAUNA', 'PISCINA', 'ALUGUEL', 'FESTAS', 'AREA_EXTERNA', 'GERAL'];
export const NEWS_CATEGORIES = ['GERAL', 'SAUNA', 'PISCINA', 'ALUGUEL'];
export const TERMS_TYPES = ['SAUNA', 'ALUGUEL', 'PRIVACIDADE', 'CANCELAMENTO'];
