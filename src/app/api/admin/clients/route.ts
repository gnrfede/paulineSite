import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";

const EXCLUDED_EMAILS = ["gnrfede@gmail.com", "spinellipaulaluciana@gmail.com"];

export interface ClientStat {
  email:             string;
  name:              string;
  phone:             string;
  totalVisits:       number;
  lastBooking:       string;
  daysSinceLast:     number;
  nextBooking:       string | null;
  topService:        string;
  newsletterConsent: boolean;
  visits:            { date: string; timeSlot: string; service: string }[];
}

function mostFrequent(arr: string[]): string {
  const freq: Record<string, number> = {};
  for (const s of arr) freq[s] = (freq[s] ?? 0) + 1;
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
}

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const [bookings, consents] = await Promise.all([
    prisma.booking.findMany({
      where: { status: "CONFIRMED", email: { notIn: EXCLUDED_EMAILS } },
      include: { service: true },
      orderBy: { date: "desc" },
    }),
    prisma.newsletterConsent.findMany({
      where: { active: true },
      select: { email: true },
    }),
  ]);

  const consentSet = new Set(consents.map((c) => c.email));
  const today = new Date().toISOString().split("T")[0];

  const map = new Map<string, {
    email: string; name: string; phone: string;
    visits: { date: string; timeSlot: string; service: string }[];
  }>();

  for (const b of bookings) {
    if (!map.has(b.email)) {
      map.set(b.email, { email: b.email, name: b.name, phone: b.phone, visits: [] });
    }
    map.get(b.email)!.visits.push({ date: b.date, timeSlot: b.timeSlot, service: b.service.name });
  }

  const clients: ClientStat[] = Array.from(map.values()).map((c) => {
    const sorted     = [...c.visits].sort((a, b) => b.date.localeCompare(a.date));
    const past       = sorted.filter((v) => v.date <= today);
    const future     = sorted.filter((v) => v.date > today);
    const lastPast   = past[0]?.date ?? null;
    const nextFuture = future.length > 0 ? [...future].sort((a, b) => a.date.localeCompare(b.date))[0].date : null;

    let daysSinceLast = -1;
    if (lastPast) {
      const diff = new Date(today).getTime() - new Date(lastPast + "T00:00:00").getTime();
      daysSinceLast = Math.floor(diff / (1000 * 60 * 60 * 24));
    }

    return {
      email:             c.email,
      name:              c.name,
      phone:             c.phone,
      totalVisits:       past.length,
      lastBooking:       sorted[0].date,
      daysSinceLast,
      nextBooking:       nextFuture,
      topService:        mostFrequent(c.visits.map((v) => v.service)),
      newsletterConsent: consentSet.has(c.email),
      visits:            sorted,
    };
  });

  clients.sort((a, b) => {
    const aRisk = !a.nextBooking ? a.daysSinceLast : -1;
    const bRisk = !b.nextBooking ? b.daysSinceLast : -1;
    return bRisk - aRisk;
  });

  return NextResponse.json(clients);
}
