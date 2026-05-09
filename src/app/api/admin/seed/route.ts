import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// One-time seed endpoint — protected by ADMIN_PASSWORD.
// Call once after first deployment, then this route does nothing if DB already has data.
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!authHeader || authHeader !== `Bearer ${adminPassword}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Idempotent: skip if services already exist
  const existing = await prisma.service.count();
  if (existing > 0) {
    return NextResponse.json({ ok: true, message: "Base de datos ya tiene datos. Nada que hacer." });
  }

  await prisma.service.createMany({
    data: [
      { name: "Peeling Químico", description: "Renovación celular controlada para manchas, acné, poros dilatados y textura irregular. Protocolos por ácidos adaptados a cada tipo de piel.", duration: 60, price: 15000, order: 1 },
      { name: "Dermapen · Microneedling", description: "Estimulación de colágeno mediante microagujas para rejuvenecimiento, cicatrices de acné y mejorar la calidad general de la piel.", duration: 75, price: 18000, order: 2 },
      { name: "Limpieza Facial Profunda", description: "Extracción profesional, higiene y equilibrio del manto hidrolipídico. La base de cualquier tratamiento efectivo.", duration: 60, price: 12000, order: 3 },
      { name: "Radiofrecuencia", description: "Tecnología de calor controlado para reafirmar y tonificar la piel, estimulando la producción natural de colágeno y elastina.", duration: 60, price: 16000, order: 4 },
      { name: "Dermaplane", description: "Exfoliación mecánica que elimina células muertas y vello facial, dejando una piel lisa, luminosa y lista para absorber activos.", duration: 45, price: 11000, order: 5 },
      { name: "Peeling Enzimático", description: "Exfoliación suave y profunda con enzimas naturales, ideal para pieles sensibles o reactivas que necesitan renovación sin agresión.", duration: 45, price: 11000, order: 6 },
      { name: "Consulta de Diagnóstico", description: "Primera consulta personalizada. Evaluamos tu piel en profundidad y diseñamos el protocolo exacto que necesitás.", duration: 30, price: 5000, order: 7 },
    ],
  });

  await prisma.schedule.createMany({
    data: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "19:00" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "19:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "19:00" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "19:00" },
      { dayOfWeek: 5, startTime: "09:00", endTime: "19:00" },
      { dayOfWeek: 6, startTime: "09:00", endTime: "14:00" },
    ],
  });

  return NextResponse.json({
    ok: true,
    message: "Base de datos inicializada con 7 servicios y 6 horarios.",
  });
}
