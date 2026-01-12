import { hashPassword } from "../../utils/hash.utils.js";
import { generateTokenPair, verifyAccessToken } from "../../utils/jwt.utils.js";
import bcrypt from "bcryptjs";

import { prisma } from "../../prisma.js";

export class AuthService {
  /**
   * Реєстрація нового користувача
   */
  async register(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string,
    confirmPassword?: string
  ) {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw { status: 400, message: "Користувач з таким email вже існує" };
    }

    if (password !== confirmPassword) {
      throw { status: 400, message: "Паролі не співпадають" };
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName || ""} ${lastName || ""}`.trim(),
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
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Invalid credentials");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error("Invalid credentials");

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
   * Оновлення токенів
   */
  async refreshTokens(refreshToken: string) {
    const user = await prisma.user.findFirst({ where: { refreshToken } });
    if (!user) throw new Error("Invalid refresh token");

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(
      user.id,
      user.email
    );
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: newRefreshToken },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
