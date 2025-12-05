import type { Task } from "../shared/types/api.types";

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Drink a glass of water",
    description: "Start the day hydrated",
    completed: false,
    createdAt: "2025-01-01T08:00:00Z",
    dueDate: "2025-01-01T12:00:00Z",
  },
  {
    id: "2",
    title: "Finish React project",
    description: "Complete header and navigation",
    completed: true,
    createdAt: "2025-01-03T14:20:00Z",
  },
  {
    id: "3",
    title: "Read 10 pages",
    description: "Continue reading Atomic Habits",
    completed: false,
    createdAt: "2025-01-04T10:30:00Z",
    dueDate: "2025-01-05T18:00:00Z",
  },
  {
    id: "4",
    title: "Short walk outside",
    completed: false,
    createdAt: "2025-01-05T09:00:00Z",
  },
  {
    id: "5",
    title: "Plan tasks for tomorrow",
    description: "Review priorities",
    completed: true,
    createdAt: "2025-01-02T19:45:00Z",
    dueDate: "2025-01-02T22:00:00Z",
  },
];
