import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/model/user";

export const COOKIE_NAME = "bugtracker_session";

export const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

function scryptAsync(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, (err, key) =>
      err ? reject(err) : resolve(key),
    );
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scryptAsync(password, salt);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [saltHex, keyHex] = (stored ?? "").split(":");
  if (!saltHex || !keyHex) return false;
  const key = await scryptAsync(password, Buffer.from(saltHex, "hex"));
  const expected = Buffer.from(keyHex, "hex");
  return key.length === expected.length && timingSafeEqual(key, expected);
}

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "Define JWT_SECRET in .env.local (at least 16 characters) and restart the server",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function createToken(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

async function readToken(token: string): Promise<string | null> {
  const key = secretKey();
  try {
    const { payload } = await jwtVerify(token, key);
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

function readCookie(header: string | null, name: string) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === name) return decodeURIComponent(rest.join("="));
  }
  return null;
}

// Returns the logged-in user (looked up fresh from the database) or null.
export async function getSessionUser(request: Request) {
  const token = readCookie(request.headers.get("cookie"), COOKIE_NAME);
  if (!token) return null;
  const userId = await readToken(token);
  if (!userId) return null;
  await connectDB();
  return User.findById(userId);
}
