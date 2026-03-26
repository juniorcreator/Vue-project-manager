import { defineStore } from "pinia";
import { ref } from "vue";
import { projectsApi } from "@/api/projects.ts";
import type { Project, ProjectStatus } from "@/types";

export const useProjectsStore = defineStore("projects", () => {
  const projects = ref<Project[]>([]);
  const loading = ref(false);
  const filterStatus = ref<ProjectStatus | "">("");

  const fetchProjects = async () => {
    loading.value = true;

    try {
      const { data } = await projectsApi.getAll();
      projects.value = data;
    } catch (error) {
      console.error("Failed to fetch projects", error);
    } finally {
      loading.value = false;
    }
  };
  const createProject = async (payload: Omit<Project, "id">) => {
    loading.value = true;
    try {
      const { data } = await projectsApi.create(payload);
      projects.value.push(data);
      return data;
    } catch (error) {
      console.error("Failed to create project", error);
    } finally {
      loading.value = false;
    }
  };
  const deleteProject = async (id: string) => {
    loading.value = true;
    try {
      await projectsApi.delete(id);
      projects.value.filter((project) => project.id !== id);
    } catch (error) {
      console.error("Failed to delete project", error);
    } finally {
      loading.value = false;
    }
  };
  const setFilterStatus = (value: ProjectStatus | "") => {
    console.log(value, "setFilterStatus value");
    filterStatus.value = value;
  };

  return {
    projects,
    loading,
    filterStatus,
    fetchProjects,
    createProject,
    deleteProject,
    setFilterStatus,
  };
});
