import { Router } from "express";
import { generatePlan } from "../../services/ai/ai.service.js";

const router = Router();

router.post("/plan", async (req, res) => {
  console.log("=== POST /plan endpoint hit ===");
  console.log("Request body:", req.body);

  const { goal, deadline, context } = req.body;

  console.log("Extracted params:", { goal, deadline, context });

  try {
    console.log("Calling generatePlan...");
    const plan = await generatePlan(goal, deadline, context);
    console.log("Plan generated successfully:", plan);
    res.json(plan);
  } catch (err: any) {
    console.error("Error in /plan endpoint:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
