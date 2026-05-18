import { z } from "zod";

export const createBookingSchema = z.object({
  serviceIds: z
    .array(z.string().min(1))
    .min(1, "Seleccioná al menos un servicio"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, "Formato de hora inválido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres").max(100),
  email: z.string().email("Email inválido"),
  phone: z
    .string()
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .max(20)
    .regex(/^[\d\s\+\-\(\)]+$/, "Teléfono inválido"),
  notes: z.string().max(500).optional(),
  newsletterConsent: z.boolean().optional(),
});

export const updateBookingSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "REJECTED", "CANCELLED"]).optional(),
  adminNote: z.string().max(500).optional(),
});

export const adminLoginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Ingresá tu contraseña"),
});

export const createServiceSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(500),
  duration: z.number().int().min(15).max(480),
  price: z.number().min(0).optional(),
  active: z.boolean().optional(),
  order: z.number().int().optional(),
});

export const updateServiceSchema = createServiceSchema.partial();

export const createScheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slots: z.string().nullable().optional(),
  active: z.boolean().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type CreateServiceInput = z.infer<typeof createServiceSchema>;
