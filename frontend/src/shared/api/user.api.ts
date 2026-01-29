import api from "./axios";

export const userApi = {
  getUserMoney() {
    return api.get("/user/money");
  },
};
