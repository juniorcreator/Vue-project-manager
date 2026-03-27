import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { tasksApi } from "@/api/tasks.ts";
import type { ProjectStatus, SortOrder, Task, TaskStatus } from "@/types";
import { applySavedOrder } from "@/utils/storage.ts";
import { useProjectsStore } from "@/stores/projects.ts";

export const useTasksStore = defineStore("tasks", () => {
  const tasks = ref<Task[]>([]);
  const loading = ref(false);
  const currentProjectId = ref<string | null>(null);
  const viewMode = ref<"table" | "kanban">("table");
  const sortKey = ref<string | null>(null);
  const sortOrder = ref<SortOrder>(null);
  const filterStatus = ref<TaskStatus | "">("");
  const filterAssignee = ref("");
  const filterName = ref("");

  const savedSettings = localStorage.getItem("tasks-settings");
  if (savedSettings) {
    try {
      const saved = JSON.parse(savedSettings);
      viewMode.value = saved.viewMode ?? "table";
      sortKey.value = saved.sortKey ?? null;
      sortOrder.value = saved.sortOrder ?? null;
      filterAssignee.value = saved.filterAssignee ?? "";
      filterStatus.value = saved.filterStatus ?? "";
    } catch (err) {
      console.error("Error while get tasks settings from localstorage", err);
    }
  }

  const writeSettingsToLocalstorage = () => {
    localStorage.setItem(
      "tasks-settings",
      JSON.stringify({
        viewMode: viewMode.value,
        sortKey: sortKey.value,
        sortOrder: sortOrder.value,
        filterAssignee: filterAssignee.value,
        filterStatus: filterStatus.value,
      }),
    );
  };

  const filteredAndSortedTasks = computed(() => {
    let result = [...tasks.value];

    if (filterAssignee.value) {
      const filterAssin = filterAssignee.value.toLowerCase();
      result = result.filter((task) => task.assignee.toLowerCase().includes(filterAssin));
    }
    if (filterStatus.value) {
      result = result.filter((task) => task.status === filterStatus.value);
    }

    if (sortKey.value && sortOrder.value) {
      const key = sortKey.value as keyof Task;
      const dir = sortOrder.value === "asc" ? 1 : -1;
      result.sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (typeof aVal === "string" && typeof bVal === "string") {
          return aVal.localeCompare(bVal) * dir;
        }
        if (typeof aVal === "number" && typeof bVal === "number") {
          return (aVal - bVal) * dir;
        }
        return 0;
      });
    } else {
      result.sort((a, b) => a.order - b.order);
    }

    return result;
  });
  const tasksByStatus = computed(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };
    const sorted = [...tasks.value].sort((a, b) => a.order - b.order);
    for (const task of sorted) {
      grouped[task.status].push(task);
    }
    return grouped;
  });
  const assignees = computed(() => {
    const set = new Set(tasks.value.map((task) => task.assignee).filter(Boolean));
    return Array.from(set).sort();
  });

  const syncProjectStats = async () => {
    if (currentProjectId.value !== null) {
      const projectsStore = useProjectsStore();
      const total = tasks.value.length;
      let newStatus: ProjectStatus = "active";

      if (total === 0) {
        newStatus = "active";
      } else if (tasks.value.every((task) => task.status === "done")) {
        newStatus = "completed";
      } else if (tasks.value.every((task) => task.status === "todo")) {
        newStatus = "active";
      } else {
        newStatus = "in_progress";
      }

      await projectsStore.updateProjectStats(currentProjectId.value, total, newStatus);
    }
  };

  const fetchTasks = async (projectId: string) => {
    loading.value = true;
    currentProjectId.value = projectId;
    try {
      const { data } = await tasksApi.getByProject(projectId);
      if (data) {
        tasks.value = applySavedOrder(data, `tasks-row-order-${projectId}`);
      } else {
        console.error("No tasks found...");
      }
    } catch (error: any) {
      tasks.value = [];
      if (error?.response?.status === 404) {
        console.log(`No tasks found for project ${projectId}`);
      } else {
        console.error("Failed to fetch tasks:", error);
      }
    } finally {
      loading.value = false;
    }
  };

  const createTask = async (payload: Omit<Task, "id">) => {
    try {
      const { data } = await tasksApi.create(payload);
      tasks.value.push(data);
      syncProjectStats();
      return data;
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  const updateTask = async (id: string, payload: Partial<Task>) => {
    try {
      const { data } = await tasksApi.update(id, payload);
      const idExist = tasks.value.findIndex((task) => task.id === id);
      if (idExist !== -1) tasks.value[idExist] = data;
      syncProjectStats();
      return data;
    } catch (err) {
      console.error("Failed to update task", err);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await tasksApi.delete(id);
      tasks.value = tasks.value.filter((task) => task.id !== id);
      syncProjectStats();
    } catch (error) {
      console.error(`Failed to delete task with id ${id}`, error);
    }
  };

  const reorderTasks = async (updatedTasks: Task[]) => {
    const reordered = updatedTasks.map((task, index) => ({ ...task, order: index }));
    tasks.value = reordered;
    if (currentProjectId.value !== null) {
      const ids = reordered.map((task) => task.id);
      localStorage.setItem(`tasks-row-order-${currentProjectId.value}`, JSON.stringify(ids));
    }

    const updatePromises = reordered.map((task) =>
      tasksApi.update(task.id, { order: task.order, status: task.status }),
    );
    await Promise.all(updatePromises).catch(console.error);
    syncProjectStats();
  };

  const setViewMode = (mode: "table" | "kanban") => {
    viewMode.value = mode;
    writeSettingsToLocalstorage();
  };

  const setSort = (key: string, order: SortOrder) => {
    sortKey.value = key;
    sortOrder.value = order;
    writeSettingsToLocalstorage();
  };

  const setFilterAssignee = (value: string) => {
    filterAssignee.value = value;
    writeSettingsToLocalstorage();
  };

  const setFilterStatus = (value: TaskStatus | "") => {
    filterStatus.value = value;
    writeSettingsToLocalstorage();
  };

  return {
    tasks,
    viewMode,
    loading,
    filterStatus,
    sortKey,
    sortOrder,
    filterAssignee,
    filterName,
    assignees,
    filteredAndSortedTasks,
    tasksByStatus,
    setFilterAssignee,
    setViewMode,
    reorderTasks,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    setSort,
    setFilterStatus,
  };
});
