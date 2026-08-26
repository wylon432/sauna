export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  image?: string | null;
  role: string;
  active: boolean;
  createdAt: Date;
}

export interface SaunaReservation {
  id: string;
  userId: string;
  scheduleId: string;
  date: Date;
  status: string;
  notes?: string | null;
  createdAt: Date;
  user?: User;
  schedule?: SaunaSchedule;
}

export interface SaunaSchedule {
  id: string;
  dayOfWeek: number;
  dayName: string;
  gender: string;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface RentalPackage {
  id: string;
  name: string;
  description: string;
  days: number;
  includesSauna: boolean;
  saunaHours: number;
  price: number;
  active: boolean;
}

export interface RentalReservation {
  id: string;
  userId: string;
  packageId: string;
  date: Date;
  endDate?: Date | null;
  status: string;
  totalValue: number;
  notes?: string | null;
  adminNotes?: string | null;
  termsAccepted: boolean;
  createdAt: Date;
  user?: User;
  package?: RentalPackage;
  payments?: Payment[];
  statusHistory?: ReservationStatusHistory[];
}

export interface Payment {
  id: string;
  userId: string;
  rentalReservationId?: string | null;
  saunaReservationId?: string | null;
  type: string;
  method: string;
  amount: number;
  description?: string | null;
  status: string;
  registeredBy?: string | null;
  createdAt: Date;
}

export interface ReservationStatusHistory {
  id: string;
  reservationId: string;
  oldStatus?: string | null;
  newStatus: string;
  changedBy?: string | null;
  reason?: string | null;
  createdAt: Date;
}

export interface Beverage {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  minStock: number;
  currentStock: number;
  active: boolean;
}

export interface ConsumptionRecord {
  id: string;
  beverageId: string;
  saunaReservationId?: string | null;
  saunaSessionId?: string | null;
  userId?: string | null;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  paymentStatus: string;
  createdAt: Date;
  beverage?: Beverage;
}

export interface SaunaSession {
  id: string;
  date: Date;
  dayOfWeek: string;
  gender: string;
  initialStock: number;
  consumedStock: number;
  remainingStock: number;
  totalValue: number;
  receivedValue: number;
  pendingValue: number;
  status: string;
  closedAt?: Date | null;
}

export interface Review {
  id: string;
  userId: string;
  rating: number;
  comment?: string | null;
  status: string;
  createdAt: Date;
  user?: User;
}

export interface GalleryImage {
  id: string;
  title?: string | null;
  description?: string | null;
  url: string;
  thumbnail?: string | null;
  category: string;
  isMain: boolean;
  published: boolean;
  sortOrder: number;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary?: string | null;
  content: string;
  image?: string | null;
  category: string;
  author?: string | null;
  status: string;
  featured: boolean;
  publishedAt?: Date | null;
  scheduledAt?: Date | null;
  createdAt: Date;
}

export interface Announcement {
  id: string;
  text: string;
  service: string;
  startDate: Date;
  endDate: Date;
  active: boolean;
}

export interface TermsVersion {
  id: string;
  type: string;
  title: string;
  content: string;
  version: number;
  active: boolean;
  author?: string | null;
  createdAt: Date;
}

export interface DamageRecord {
  id: string;
  rentalReservationId: string;
  item: string;
  description: string;
  photos?: string | null;
  value?: number | null;
  status: string;
}

export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  category: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  details?: string | null;
  ipAddress?: string | null;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
}

export interface CalendarBlock {
  id: string;
  date: Date;
  service: string;
  blocked: boolean;
  reason?: string | null;
}
