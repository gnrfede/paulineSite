import { prisma } from "./db";

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export async function getAvailableSlots(
  date: string,
  serviceDuration: number
): Promise<string[]> {
  const d = new Date(date + "T00:00:00");
  const dayOfWeek = d.getDay();

  // Check if date is blocked
  const blocked = await prisma.blockedDate.findFirst({ where: { date } });
  if (blocked) return [];

  // Get schedule for this day
  const schedule = await prisma.schedule.findFirst({
    where: { dayOfWeek, active: true },
  });
  if (!schedule) return [];

  // Get existing confirmed/pending bookings for this date
  const existingBookings = await prisma.booking.findMany({
    where: { date, status: { in: ["PENDING", "CONFIRMED"] } },
    include: { service: true },
  });

  const occupied: Array<{ start: number; end: number }> = existingBookings.map((b) => ({
    start: timeToMinutes(b.timeSlot),
    end: timeToMinutes(b.timeSlot) + b.service.duration,
  }));

  function isAvailable(slotTime: string): boolean {
    const start = timeToMinutes(slotTime);
    const end = start + serviceDuration;
    return !occupied.some((o) => start < o.end && end > o.start);
  }

  // Mode 1: specific slots defined in the schedule
  if (schedule.slots) {
    return schedule.slots
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^\d{2}:\d{2}$/.test(s) && isAvailable(s));
  }

  // Mode 2: generate slots every 30 min within the working range
  const startMin = timeToMinutes(schedule.startTime);
  const endMin = timeToMinutes(schedule.endTime);
  const slots: string[] = [];

  for (let t = startMin; t + serviceDuration <= endMin; t += 30) {
    const slotTime = minutesToTime(t);
    if (isAvailable(slotTime)) slots.push(slotTime);
  }

  return slots;
}
