// Server-only auth helpers (Node.js runtime, uses bcryptjs + jose)
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export { COOKIE_NAME } from "./auth-edge";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-in-production"
);

const COOKIE_NAME_LOCAL = "pauline_admin_token";

export async function signAdminToken(email: string): Promise<string> {
  return new SignJWT({ email, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyAdminToken(
  token: string
): Promise<{ email: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { email: string; role: string };
  } catch {
    return null;
  }
}

export async function getAdminFromCookie(): Promise<{ email: string; role: string } | null> {
  // cookies() is synchronous in Next.js 14, async in Next.js 15.
  // Using await works in both versions.
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME_LOCAL)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export function validateAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@paulinestudio.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  return email === adminEmail && password === adminPassword;
}

// Kept for completeness but not used (passwords not stored in DB)
export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}
