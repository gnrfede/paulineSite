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
  // Parse the date
  const d = new Date(date + "T00:00:00");
  const dayOfWeek = d.getDay(); // 0=Sun, 6=Sat

  // Check if date is blocked
  const blocked = await prisma.blockedDate.findFirst({ where: { date } });
  if (blocked) return [];

  // Get schedule for this day
  const schedule = await prisma.schedule.findFirst({
    where: { dayOfWeek, active: true },
  });
  if (!schedule) return [];

  const startMin = timeToMinutes(schedule.startTime);
  const endMin = timeToMinutes(schedule.endTime);

  // Get existing confirmed/pending bookings for this date
  const existingBookings = await prisma.booking.findMany({
    where: {
      date,
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    include: { service: true },
  });

  // Build occupied intervals
  const occupied: Array<{ start: number; end: number }> = existingBookings.map((b) => ({
    start: timeToMinutes(b.timeSlot),
    end: timeToMinutes(b.timeSlot) + b.service.duration,
  }));

  // Generate slots every 30 minutes within working hours
  const slots: string[] = [];
  const slotInterval = 30;

  for (let t = startMin; t + serviceDuration <= endMin; t += slotInterval) {
    const slotEnd = t + serviceDuration;
    const overlaps = occupied.some(
      (o) => t < o.end && slotEnd > o.start
    );
    if (!overlaps) {
      slots.push(minutesToTime(t));
    }
  }

  return slots;
}
