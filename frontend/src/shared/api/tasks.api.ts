import api from "./axios";

export const tasksApi = {
  getTasksByGoal(goalId: number) {
    return api.get(`/tasks/goals/${goalId}`);
  },

  // createTask(goalId: number, data: { title: string; description?: string; dueDate?: string }) {
  //   return api.post(`/goals/${goalId}/tasks`, data);
  // },
};
