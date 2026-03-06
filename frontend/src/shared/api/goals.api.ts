import api from "./axios";

export const goalsApi = {
  getUserGoals() {
    return api.get("/goals/");
  },

  getGoalById(goalId: number) {
    return api.get(`/goals/${goalId}`);
  },

  createGoal(data: { title: string; deadline: string }) {
    return api.post("/goals/", data);
  },

  getDaysTillDeadline(goalId: number) {
    return api.get(`/goals/${goalId}/days-till-deadline`);
  },
};
