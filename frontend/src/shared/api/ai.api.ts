import api from "./axios";

export const aiApi = {
  generatePlan(data: { goal: string; deadline: string; context?: string }) {
    return api.post("/api/ai/plan", data);
  },
};
