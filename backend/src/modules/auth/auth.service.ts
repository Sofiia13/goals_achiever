import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../../utils/hash.utils.js";
import { generateTokenPair } from "../../utils/jwt.utils.js";

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Реєстрація нового користувача
   */
  async register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName || ''} ${lastName || ''}`.trim(),
      },
    });

    const { accessToken, refreshToken } = generateTokenPair(
      user.id,
      user.email
    );
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  /**
   * Логін користувача
   */
  async login(email: string, password: string) {
    // Логіка логіну користувача
  }

  /**
   * Оновлення токенів
   */
  async refreshTokens(refreshToken: string) {
    // Логіка оновлення токенів
  }
}
