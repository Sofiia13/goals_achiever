import { GoogleGenAI } from "@google/genai";
import { prisma } from "../../prisma";

export class AiService {
  static async generatePlan(
  userId: number,
  goal: string,
  deadline: string,
  context?: string
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
Ти — генератор JSON.

Відповідай ТІЛЬКИ у валідному JSON форматі.
Без пояснень, без тексту, без вступу.

Схема:
{
  "tasks": [
    { "title": "", "description": "", "dueDate": "" }
  ]
}

Мета: "${goal}"
Дедлайн: "${deadline}"
Контекст: "${context || "нема"}"

Згенеруй детальний покроковий план по днях.
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
}

