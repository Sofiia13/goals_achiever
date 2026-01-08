import { Router } from "express";
import { AuthController } from "./auth.controller.js";

const router = Router();

router.get("/me", AuthController.getCurrentUser);
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/refresh", AuthController.refresh);

export const authRouter = router;