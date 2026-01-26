import api from "./axios";

export const tasksApi = {
  getTasksByGoal(goalId: number) {
    return api.get(`/tasks/goals/${goalId}`);
  },

  getDailyTasks(goalId: number) {
    return api.get(`/tasks/goals/${goalId}/daily-tasks`);
  },

  updateTaskDetails(taskId: number, title: string, description: string) {
    return api.patch(`/tasks/${taskId}/details`, { title, description });
  },

  updateTaskStatus(taskId: number, status: string) {
    return api.patch(`/tasks/${taskId}/status`, { status });
  },

  // createTask(goalId: number, data: { title: string; description?: string; dueDate?: string }) {
  //   return api.post(`/goals/${goalId}/tasks`, data);
  // },
};
