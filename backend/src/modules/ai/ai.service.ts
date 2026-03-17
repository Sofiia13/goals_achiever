import { GoogleGenAI } from "@google/genai";
import { prisma } from "../../prisma.js";

export class AiService {
  static async getProgressInfo(goalId: number) {
    const goal = await prisma.goal.findUnique({
      where: { id: goalId },
      include: {
        tasks: {
          orderBy: { generatedAt: "asc" },
        },
      },
    });

    if (!goal) {
      throw new Error("Goal not found");
    }

    const stations = goal.tasks.filter((task) => task.type !== "daily");

    const dailyTasks = goal.tasks.filter((task) => task.type === "daily");

    const nextStation = stations.find((task) => task.status === "pending");

    const completedDailyTasks = dailyTasks.filter(
      (task) => task.status === "done",
    );

    let previousProgress = null;
    if (completedDailyTasks.length > 0) {
      previousProgress = completedDailyTasks
        .map((task) => `- ${task.title}`)
        .join("\n");
    }

    return {
      nextStation: nextStation?.title || "Complete the goal",
      previousProgress,
      goal,
    };
  }

  static async generatePlan(
    userId: number,
    goal: string,
    deadline: string,
    context?: string,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log("=== API Key Debug ===");
    console.log("API Key exists:", !!apiKey);
    console.log("API Key length:", apiKey?.length);
    console.log("API Key starts with:", apiKey?.substring(0, 10));
    console.log("API Key has spaces:", apiKey?.includes(" "));

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

    const prompt = `
You are a JSON generator.

Respond ONLY with valid JSON.
Do NOT include any text, comments, explanations, or line breaks outside the JSON.
Do not truncate the output.

JSON Schema:
{
  "tasks": [
    { "title": "", "description": "", "dueDate": "" }
  ]
}

Goal: "${goal}"
Deadline: "${deadline}"
Context: "${context || "none"}"

Break the main goal into smaller objectives (like stations).
Each task must have a title, description, and due date.
Generate a realistic, detailed step-by-step plan.
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const rawText = response.text ?? "";
      if (!rawText.trim()) {
        throw new Error("AI не повернув текст");
      }

      const cleaned = rawText
        .trim()
        .replace(/^```json\s*/, "")
        .replace(/```$/, "");

      const planJson = JSON.parse(cleaned);

      const MONEY_FOR_PLAN_GENERATION = 10;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || user.money < MONEY_FOR_PLAN_GENERATION) {
        throw new Error("Insufficient funds to generate a plan");
      }

      const goalRecord = await prisma.goal.create({
        data: {
          title: goal,
          context: context || "",
          deadline: new Date(deadline),
          userId,
          tasks: {
            create: planJson.tasks.map((task: any) => ({
              title: task.title,
              status: "pending",
              description: task.description || "",
              dueDate: task.dueDate ? new Date(task.dueDate) : null,
              estimatedMinutes: Number(task.estimatedMinutes) || null,
            })),
          },
        },
        include: { tasks: true },
      });

      await prisma.user.updateMany({
        where: { id: userId },
        data: { money: { decrement: MONEY_FOR_PLAN_GENERATION } },
      });

      return goalRecord;
    } catch (err) {
      console.error("Failed to generate plan:", err);

      if (err instanceof Error) {
        console.error("Error details:", err.message);
      }

      return { tasks: [] };
    }
  }

  static async generateDailyTasks(
    goalId: number,
    nextStation: string,
    previousProgress: string | null,
  ) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }

    const goalData = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { tasks: true },
    });

    if (!goalData) {
      throw new Error("Goal not found");
    }

    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setUTCHours(23, 59, 59, 999);

    const MONEY_FOR_DAILY_TASKS_GENERATION = 1;

    const todaysDailyTasks = await prisma.task.findMany({
      where: {
        goalId,
        type: "daily",
        generatedAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
      orderBy: { generatedAt: "asc" },
    });

    if (todaysDailyTasks.length > 0) {
      return { tasks: todaysDailyTasks };
    }

    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });

    const prompt = `
You are a planning AI that generates DAILY tasks.

Respond ONLY with valid JSON.
Do NOT include any text, comments, explanations, or markdown.
Do NOT wrap the response in code blocks.

JSON Schema:
{
  "tasks": [
    {
      "title": "",
      "description": "",
      "dueDate": "",
      "estimatedMinutes": 0,
      "progressContribution": 0
    }
  ]
}

User goal progression system:
- The user moves step by step through "stations".
- Each station represents a meaningful milestone toward the main goal.
- Today’s tasks must help the user reach the NEXT station.
Main goal: "${goalData.title}"
Deadline: "${goalData.deadline}"
Context: "${goalData.context || "none"}"
Next station to reach:
"${nextStation}"

What the user has already done in previous days:
"${previousProgress || "No previous progress provided"}"

Rules:
- Generate tasks ONLY for ONE day (today).
- Generate 3–5 small, realistic, actionable tasks.
- Each task should contribute 15-25% progress (sum = 60-100% for ONE day).
- A typical station takes 3-7 days to complete with consistent daily progress.
- Tasks must be achievable in a normal day (no overload).
- Tasks must logically follow from what the user has already done.
- Do NOT repeat tasks that were already completed.
- Focus on progress, not perfection.
- Each task should take 15–60 minutes.
- Due date must be today's date in ISO format (YYYY-MM-DD).
- progressContribution must be a number between 15 and 25 (total should sum to ~70%).

Think step-by-step:
1. Understand what the user has already completed.
2. Determine what is the most logical NEXT step toward the station.
3. Generate today’s tasks to move closer to that station.4. Assign progress contribution based on task importance and difficulty.

Example:
{
  "tasks": [
    { "title": "Read chapter 1", "description": "...", "dueDate": "2024-01-15", "estimatedMinutes": 30, "progressContribution": 20 },
    { "title": "Take notes", "description": "...", "dueDate": "2024-01-15", "estimatedMinutes": 20, "progressContribution": 20 },
    { "title": "Practice exercises", "description": "...", "dueDate": "2024-01-15", "estimatedMinutes": 40, "progressContribution": 20 },
    { "title": "Review key concepts", "description": "...", "dueDate": "2024-01-15", "estimatedMinutes": 15, "progressContribution": 15 }
  ]
}
Return ONLY valid JSON.
`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const rawText = response.text ?? "";
      if (!rawText.trim()) {
        throw new Error("AI не повернув текст");
      }

      const cleaned = rawText
        .trim()
        .replace(/^```json\s*/, "")
        .replace(/```$/, "");

      const planJson = JSON.parse(cleaned);

      const user = await prisma.user.findUnique({
        where: { id: goalData.userId },
      });

      if (!user || user.money < MONEY_FOR_DAILY_TASKS_GENERATION) {
        throw new Error("Insufficient funds to generate daily tasks");
      }

      await prisma.task.createMany({
        data: planJson.tasks.map((task: any) => ({
          title: task.title,
          status: "pending",
          description: task.description || "",
          dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
          estimatedMinutes: Number(task.estimatedMinutes) || null,
          progressContribution: Number(task.progressContribution) || null,
          station: nextStation,
          type: "daily",
          goalId: goalId,
        })),
      });

      const tasks = await prisma.task.findMany({
        where: {
          goalId: goalId,
          type: "daily",
          generatedAt: {
            gte: startOfToday,
            lte: endOfToday,
          },
        },
        orderBy: { generatedAt: "asc" },
      });

      await prisma.user.updateMany({
        where: { id: user.id },
        data: { money: { decrement: MONEY_FOR_DAILY_TASKS_GENERATION } },
      });

      return { tasks };
    } catch (err) {
      console.error("Failed to generate daily tasks:", err);

      if (err instanceof Error) {
        console.error("Error details:", err.message);
      }

      return { tasks: [] };
    }
  }
}
