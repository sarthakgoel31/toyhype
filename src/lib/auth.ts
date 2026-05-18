import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

const getSecret = () => {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET env var is required");
  }
  return new TextEncoder().encode(secret);
};

export async function verifyPin(pin: string): Promise<boolean> {
  const raw = process.env.ADMIN_PIN_HASH;
  if (!raw) {
    throw new Error("ADMIN_PIN_HASH is not set");
  }
  const hash = raw.startsWith("$2") ? raw : Buffer.from(raw, "base64").toString("utf-8");
  if (!hash.startsWith("$2")) {
    throw new Error(
      "ADMIN_PIN_HASH must be a base64-encoded bcrypt hash. Never store the raw PIN."
    );
  }
  return bcrypt.compare(pin, hash);
}

export async function createSession(): Promise<string> {
  const secret = getSecret();
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    const secret = getSecret();
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}
