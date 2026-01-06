import api from "./axios";

export const authApi = {
  register(data: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    confirmPassword?: string;
  }) {
    console.log("REGISTER DATA:", data);

    return api.post("/auth/register", data);
  },

  login(data: { email: string; password: string }) {
    return api.post("/auth/login", data);
  },

  refresh() {
    return api.post("/auth/refresh");
  },
};
