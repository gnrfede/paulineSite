import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.blockedDate.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.service.deleteMany();

  // Services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "Peeling Químico",
        description:
          "Renovación celular controlada para manchas, acné, poros dilatados y textura irregular. Protocolos por ácidos adaptados a cada tipo de piel.",
        duration: 60,
        price: 15000,
        order: 1,
      },
    }),
    prisma.service.create({
      data: {
        name: "Dermapen · Microneedling",
        description:
          "Estimulación de colágeno mediante microagujas para rejuvenecimiento, cicatrices de acné y mejorar la calidad general de la piel.",
        duration: 75,
        price: 18000,
        order: 2,
      },
    }),
    prisma.service.create({
      data: {
        name: "Limpieza Facial Profunda",
        description:
          "Extracción profesional, higiene y equilibrio del manto hidrolipídico. La base de cualquier tratamiento efectivo.",
        duration: 60,
        price: 12000,
        order: 3,
      },
    }),
    prisma.service.create({
      data: {
        name: "Radiofrecuencia",
        description:
          "Tecnología de calor controlado para reafirmar y tonificar la piel, estimulando la producción natural de colágeno y elastina.",
        duration: 60,
        price: 16000,
        order: 4,
      },
    }),
    prisma.service.create({
      data: {
        name: "Dermaplane",
        description:
          "Exfoliación mecánica que elimina células muertas y vello facial, dejando una piel lisa, luminosa y lista para absorber activos.",
        duration: 45,
        price: 11000,
        order: 5,
      },
    }),
    prisma.service.create({
      data: {
        name: "Peeling Enzimático",
        description:
          "Exfoliación suave y profunda con enzimas naturales, ideal para pieles sensibles o reactivas que necesitan renovación sin agresión.",
        duration: 45,
        price: 11000,
        order: 6,
      },
    }),
    prisma.service.create({
      data: {
        name: "Consulta de Diagnóstico",
        description:
          "Primera consulta personalizada. Evaluamos tu piel en profundidad y diseñamos el protocolo exacto que necesitás.",
        duration: 30,
        price: 5000,
        order: 7,
      },
    }),
  ]);

  console.log(`✅ Created ${services.length} services`);

  // Working schedule (Mon–Fri 9:00–19:00, Sat 9:00–14:00)
  const schedules = await Promise.all([
    prisma.schedule.create({ data: { dayOfWeek: 1, startTime: "09:00", endTime: "19:00" } }),
    prisma.schedule.create({ data: { dayOfWeek: 2, startTime: "09:00", endTime: "19:00" } }),
    prisma.schedule.create({ data: { dayOfWeek: 3, startTime: "09:00", endTime: "19:00" } }),
    prisma.schedule.create({ data: { dayOfWeek: 4, startTime: "09:00", endTime: "19:00" } }),
    prisma.schedule.create({ data: { dayOfWeek: 5, startTime: "09:00", endTime: "19:00" } }),
    prisma.schedule.create({ data: { dayOfWeek: 6, startTime: "09:00", endTime: "14:00" } }),
  ]);

  console.log(`✅ Created ${schedules.length} schedule entries`);
  console.log("✅ Seed complete!");
  console.log("");
  console.log("Admin credentials:");
  console.log("  Email:", process.env.ADMIN_EMAIL || "admin@paulinestudio.com");
  console.log("  Password: set via ADMIN_PASSWORD env var");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
