import type { Metadata } from "next";
import { Dancing_Script, Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-dancing",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Paula Spinelli · Cosmiatra | Pauline Studio",
  description:
    "+13 años de experiencia. Tratamientos faciales y corporales personalizados en Caballito, Buenos Aires. Reservá tu turno online.",
  keywords: [
    "cosmiatra",
    "cosmetóloga",
    "Buenos Aires",
    "Caballito",
    "peeling químico",
    "dermapen",
    "microneedling",
    "limpieza facial",
    "radiofrecuencia",
    "Paula Spinelli",
    "Pauline Studio",
  ],
  openGraph: {
    title: "Paula Spinelli · Cosmiatra | Pauline Studio",
    description: "Tratamientos faciales y corporales personalizados en Caballito, Buenos Aires.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${dancingScript.variable} ${playfairDisplay.variable} ${dmSans.variable}`}
    >
      <body className="overflow-x-hidden">{children}</body>
    </html>
  );
}
