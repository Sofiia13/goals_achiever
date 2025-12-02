import { GoogleGenAI } from "@google/genai";

export async function generatePlan(
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
Мета: ${goal}
Дедлайн: ${deadline}
Контекст: ${context || "нема"}

Згенеруй покроковий план у форматі JSON:

{
  "tasks": [
    { "title": "", "description": "", "dueDate": "" }
  ]
}
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

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Failed to generate plan:", err);

    if (err instanceof Error) {
      console.error("Error details:", err.message);
    }

    return { tasks: [] };
  }
}
