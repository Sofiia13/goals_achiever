export interface Goal {
  id: number;
  title: string;
  context?: string;
  createdAt: Date;
  deadline?: Date;
  userId: number;
  tasks?: Task[];
  completedAt?: Date;
  currentStationProgress: number; // прогрес до наступної станції (0-100%)
}

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "pending" | "done";
  goalId: number;
  generatedAt: Date;
  dueDate?: Date;
  type: string;
  progressContribution?: number; // скільки % прогресу дає ця таска
}
