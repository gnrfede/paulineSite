import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminFromCookie } from "@/lib/auth";

export async function GET() {
  const admin = await getAdminFromCookie();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const consents = await prisma.newsletterConsent.findMany({
    where: { active: true },
    orderBy: { consentedAt: "desc" },
  });

  return NextResponse.json(consents);
}
