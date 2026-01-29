import api from "./axios";

export const goalsApi = {
  getUserGoals() {
    return api.get("/goals/");
  },

  getGoalById(goalId: number) {
    return api.get(`/goals/${goalId}`);
  },

  getDaysTillDeadline(goalId: number) {
    return api.get(`/goals/${goalId}/days-till-deadline`);
  },
};
