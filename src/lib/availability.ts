import { prisma } from "./db";

export async function getAvailableSlots(
  date: string,
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

  // Slots already taken on this date (any status that occupies the seat)
  const takenSlots = new Set(
    (
      await prisma.booking.findMany({
        where: { date, status: { in: ["PENDING", "CONFIRMED"] } },
        select: { timeSlot: true },
      })
    ).map((b) => b.timeSlot)
  );

  // Mode 1: specific slots defined in the schedule
  if (schedule.slots) {
    return schedule.slots
      .split(",")
      .map((s) => s.trim())
      .filter((s) => /^\d{2}:\d{2}$/.test(s) && !takenSlots.has(s));
  }

  // Mode 2: generate slots every 30 min within the working range
  const [sh, sm] = schedule.startTime.split(":").map(Number);
  const [eh, em] = schedule.endTime.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const slots: string[] = [];

  for (let t = startMin; t < endMin; t += 30) {
    const hh = Math.floor(t / 60).toString().padStart(2, "0");
    const mm = (t % 60).toString().padStart(2, "0");
    const slot = `${hh}:${mm}`;
    if (!takenSlots.has(slot)) slots.push(slot);
  }

  return slots;
}
