import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { UserController } from "./user.controller";

const router = Router();

router.get("/money", authMiddleware, UserController.getUserMoney);

export const userRouter = router;
