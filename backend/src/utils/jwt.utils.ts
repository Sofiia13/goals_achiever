import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { randomUUID } from "crypto";
import type { JwtPayload } from "../modules/auth/auth.types.js"; // відносний шлях до твоїх типів

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || "15m";

/**
 * Генерує короткотривалий Access Token
 */
export function generateAccessToken(payload: JwtPayload): string {
  const secret: Secret = JWT_SECRET;

  const options: SignOptions = {
    expiresIn: JWT_ACCESS_EXPIRATION as `${number}${"s" | "m" | "h" | "d"}`,
  };

  return jwt.sign(payload, secret, options);
}

/**
 * Генерує довготривалий Refresh Token
 */
export function generateRefreshToken(): string {
  return randomUUID();
}

/**
 * Перевірка валідності Access Token
 */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Access token expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error("Invalid access token");
    }
    throw error;
  }
}

/**
 * Повертає дату закінчення токена
 */
export function getTokenExpirationDate(token: string): Date {
  const decoded = jwt.decode(token) as { exp?: number } | null;

  if (!decoded || !decoded.exp) {
    throw new Error("Token does not have expiration");
  }

  return new Date(decoded.exp * 1000);
}

/**
 * Створює пару токенів для користувача
 */
export function generateTokenPair(userId: number, email: string) {
  const accessToken = generateAccessToken({ userId, email });
  const refreshToken = generateRefreshToken();

  return { accessToken, refreshToken };
}
