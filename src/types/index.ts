export type BookingStatus = "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number | null;
  active: boolean;
  order: number;
}

export interface Schedule {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  active: boolean;
}

export interface BlockedDate {
  id: string;
  date: string;
  reason?: string | null;
}

export interface Booking {
  id: string;
  serviceId: string;
  service: Service;
  date: string;
  timeSlot: string;
  name: string;
  email: string;
  phone: string;
  notes?: string | null;
  status: BookingStatus;
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingInput {
  serviceId: string;
  date: string;
  timeSlot: string;
  name: string;
  email: string;
  phone: string;
  notes?: string;
}

export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AvailabilityResponse {
  date: string;
  slots: string[];
}

export const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  REJECTED: "Rechazado",
  CANCELLED: "Cancelado",
};

export const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-teal-100 text-teal-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};
