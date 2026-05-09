import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";

export async function GET() {
  const blocked = await prisma.blockedDate.findMany({
    orderBy: { date: "asc" },
  });
  return NextResponse.json(blocked);
}

export async function POST(req: NextRequest) {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { date, reason } = await req.json();

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Fecha inválida" }, { status: 400 });
  }

  const blocked = await prisma.blockedDate.upsert({
    where: { date },
    update: { reason },
    create: { date, reason },
  });

  return NextResponse.json(blocked, { status: 201 });
}
