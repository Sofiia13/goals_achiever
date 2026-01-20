import { GoogleGenAI } from "@google/genai";
import { prisma } from "../../prisma";

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
      (task) => task.status === "done"
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
            })),
          },
        },
        include: { tasks: true },
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

    // Отримуємо goal для контексту
    const goalData = await prisma.goal.findUnique({
      where: { id: goalId },
      include: { tasks: true },
    });

    if (!goalData) {
      throw new Error("Goal not found");
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
      "dueDate": ""
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
- Tasks must be achievable in a normal day (no overload).
- Tasks must logically follow from what the user has already done.
- Do NOT repeat tasks that were already completed.
- Focus on progress, not perfection.
- Each task should take 15–60 minutes.
- Due date must be today’s date in ISO format (YYYY-MM-DD).

Think step-by-step:
1. Understand what the user has already completed.
2. Determine what is the most logical NEXT step toward the station.
3. Generate today’s tasks to move closer to that station.

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

      await prisma.task.createMany({
        data: planJson.tasks.map((task: any) => ({
          title: task.title,
          status: "pending",
          description: task.description || "",
          dueDate: task.dueDate ? new Date(task.dueDate) : new Date(),
          station: nextStation,
          type: "daily",
          goalId: goalId,
        })),
      });

      const tasks = await prisma.task.findMany({
        where: { 
          goalId: goalId,
          generatedAt: { gte: new Date(Date.now() - 60000) }
        },
        orderBy: { generatedAt: "desc" },
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
