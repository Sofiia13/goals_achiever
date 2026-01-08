import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";

const authService = new AuthService();

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, confirmPassword } =
        req.body;

      console.log(req.body);

      const result = await authService.register(
        email,
        password,
        firstName,
        lastName,
        confirmPassword
      );
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ message: err.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ message: err.message });
    }
  }

  static async refresh(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshTokens(refreshToken);
      res.json(result);
    } catch (err: any) {
      res.status(401).json({ message: err.message });
    }
  }

  static async getCurrentUser(req: Request, res: Response) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) return res.status(401).json({ message: "No token" });

      const token = authHeader.split(" ")[1];

      if (!token) return res.status(401).json({ message: "No token" });

      const user = await authService.getUserFromToken(token);
      if (!user) return res.status(404).json({ message: "User not found" });

      res.json({ id: user.id, email: user.email, name: user.name });
    } catch (err: any) {
      res.status(401).json({ message: err.message });
    }
  }
}
