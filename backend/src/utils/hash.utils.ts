import bcrypt from 'bcryptjs';

/**
 * Хешує пароль
 * @param password - пароль користувача
 * @returns хешований пароль
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10; // кількість раундів солі
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

/**
 * Перевіряє пароль
 * @param password - пароль користувача
 * @param hashedPassword - збережений хеш пароля
 * @returns true, якщо пароль правильний
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
