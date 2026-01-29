import { UserService } from "./user.service";
import { Request, Response } from "express";

const userService = new UserService();

export class UserController {
  static async getUserInfo(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userInfo = await userService.getUserById(user.id);
      res.json(userInfo);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }

  static async getUserMoney(req: Request, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const money = await userService.getUserMoney(user.id);
      res.json({ money });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
}
