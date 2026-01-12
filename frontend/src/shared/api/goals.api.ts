import api from "./axios";

export const goalsApi = {
  getUserGoals() {
    return api.get("/goals/");
  },
};
