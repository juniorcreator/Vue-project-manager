import { defineStore } from "pinia";
import { computed, ref } from "vue";
import { projectsApi } from "@/api/projects.ts";
import type { Project, ProjectStatus, SortOrder } from "@/types";
import { applySavedOrder } from "@/utils/storage.ts";

export const useProjectsStore = defineStore("projects", () => {
  const projects = ref<Project[]>([]);
  const loading = ref(false);
  const filterStatus = ref<ProjectStatus | "">("");
  const sortKey = ref<string | null>(null);
  const sortOrder = ref<SortOrder>(null);
  const filterName = ref("");

  const savedSettings = localStorage.getItem("projects-settings");
  if (savedSettings) {
    try {
      const saved = JSON.parse(savedSettings);
      sortKey.value = saved.sortKey ?? null;
      sortOrder.value = saved.sortOrder ?? null;
      filterName.value = saved.filterName ?? "";
      filterStatus.value = saved.filterStatus ?? "";
    } catch (err) {
      console.error("Error while get settings from localstorage", err);
    }
  }

  const writeSettingsToLocalstorage = () => {
    localStorage.setItem(
      "projects-settings",
      JSON.stringify({
        sortKey: sortKey.value,
        sortOrder: sortOrder.value,
        filterName: filterName.value,
        filterStatus: filterStatus.value,
      }),
    );
  };

  const fetchProjects = async () => {
    loading.value = true;
    try {
      const { data } = await projectsApi.getAll();
      projects.value = applySavedOrder(data, "projects-row-order");
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      loading.value = false;
    }
  };

  const createProject = async (payload: Omit<Project, "id">) => {
    try {
      const { data } = await projectsApi.create(payload);
      projects.value.push(data);
    } catch (error) {
      console.error("Failed to create project", error);
    }
  };

  const filteredAndSortedProjects = computed(() => {
    let result = [...projects.value];

    if (filterName.value) {
      const filtName = filterName.value.toLowerCase();
      result = result.filter((project) => project.name.toLowerCase().includes(filtName));
    }
    if (filterStatus.value) {
      result = result.filter((project) => project.status === filterStatus.value);
    }

    if (sortKey.value && sortOrder.value) {
      const key = sortKey.value as keyof Project;
      const direction = sortOrder.value === "asc" ? 1 : -1;
      result.sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (typeof aVal === "string" && typeof bVal === "string") {
          return aVal.localeCompare(bVal) * direction;
        }
        if (typeof aVal === "number" && typeof bVal === "number") {
          return (aVal - bVal) * direction;
        }
        return 0;
      });
    }

    return result;
  });

  const updateProject = async (id: string, payload: Partial<Project>) => {
    try {
      const { data } = await projectsApi.update(id, payload);
      const idExist = projects.value.findIndex((project) => project.id === id);
      if (idExist !== -1) projects.value[idExist] = data;
      return data;
    } catch (err) {
      console.error("Failed to update project", err);
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await projectsApi.delete(id);
      projects.value = projects.value.filter((project) => project.id !== id);
    } catch (error) {
      console.error("Failed to delete project", error);
    }
  };

  const setSort = (key: string, order: SortOrder) => {
    sortKey.value = key;
    sortOrder.value = order;
    writeSettingsToLocalstorage();
  };

  const reorderProjects = (reordered: Project[]) => {
    projects.value = reordered;
    const ids = reordered.map((proj) => proj.id);
    localStorage.setItem("projects-row-order", JSON.stringify(ids));
  };

  const setFilterName = (value: string) => {
    filterName.value = value;
    writeSettingsToLocalstorage();
  };

  const setFilterStatus = (value: ProjectStatus | "") => {
    filterStatus.value = value;
    writeSettingsToLocalstorage();
  };

  const updateProjectStats = async (projectId: string, count: number, status: ProjectStatus) => {
    const project = projects.value.find((proj) => proj.id === projectId);
    if (project) {
      project.taskCount = count;
      project.status = status;
      try {
        await projectsApi.update(projectId, { status, taskCount: count });
      } catch (error) {
        console.error("Failed to updateProjectStats", error);
      }
    }
  };

  return {
    projects,
    loading,
    filterStatus,
    sortKey,
    sortOrder,
    filterName,
    filteredAndSortedProjects,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    reorderProjects,
    setFilterName,
    setSort,
    setFilterStatus,
    updateProjectStats,
  };
});
