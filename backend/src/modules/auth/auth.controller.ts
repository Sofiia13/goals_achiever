import { Request, Response } from "express";
import { AuthService } from "./auth.service.js";

const authService = new AuthService();

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName } = req.body;
      const result = await authService.register(email, password, firstName, lastName);
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
}
