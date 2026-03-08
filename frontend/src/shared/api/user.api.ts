import api from "./axios";

export const userApi = {
  getUserMoney() {
    return api.get("/user/money");
  },

  getUserStreak() {
    return api.get("/user/streak");
  },
};
