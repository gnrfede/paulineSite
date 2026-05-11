import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";
import { z } from "zod";

const blockedDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido"),
  reason: z.string().max(200).optional(),
});

export async function GET() {
  const blocked = await prisma.blockedDate.findMany({
    orderBy: { date: "asc" },
  });
  return NextResponse.json(blocked);
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const parsed = blockedDateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  const blocked = await prisma.blockedDate.upsert({
    where: { date: parsed.data.date },
    update: { reason: parsed.data.reason },
    create: { date: parsed.data.date, reason: parsed.data.reason },
  });

  return NextResponse.json(blocked, { status: 201 });
}
