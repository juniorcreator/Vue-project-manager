import api from "./index.ts";
import type { Task } from "@/types";

export const tasksApi = {
  getByProject: (projectId: string) => api.get<Task[]>(`/tasks?projectId=${projectId}`),
  getAll: () => api.get<Task[]>("/tasks"),
  create: (data: Omit<Task, "id">) => api.post<Task>(`/tasks/`, data),
  update: (id: string, data: Partial<Task>) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  deleteByProject: async (projectId: string) => {
    const { data: tasks } = await tasksApi.getByProject(projectId);
    const ids = tasks.map((task) => task.id);
    if (!tasks.length) return;
    for (const task of tasks) {
      try {
        await tasksApi.delete(task.id);
      } catch (error) {
        console.error(`Could not delete task ${task.id}`, error);
      }
    }
    return ids;
  },
};
