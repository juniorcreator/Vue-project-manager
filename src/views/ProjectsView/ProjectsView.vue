<script setup lang="ts">
import { ref, onMounted } from "vue";
import { projectsApi } from "@/api/projects.ts";
import { tasksApi } from "@/api/tasks.ts";
import { useProjectsStore } from "@/stores/projects.ts";
import type { ProjectStatus, Task } from "@/types";
import { columns } from "@/constants/table.ts";
import AppModal from "@/components/AppModal.vue";
import ProjectForm from "@/components/ProjectForm.vue";

const projectsStore = useProjectsStore();
const allTasks = ref<Task[]>([]);
const showModal = ref(true);

onMounted(async () => {
  await projectsStore.fetchProjects();

  try {
    const { data } = await tasksApi.getAll();
    allTasks.value = data;
  } catch (error) {
    console.error("onMounted error occurred", error);
  }
});

const handleCreate = async (data: { name: string; description: string }) => {
  await projectsStore.createProject({
    name: data.name,
    description: data.description,
    status: "active",
    createdAt: new Date().toISOString().split("T")[0],
    taskCount: 0,
  });

  showModal.value = false;
};
</script>
<template>
  <div class="projects-page container">
    <div class="page-header">
      <h1>Projects</h1>
      <button>Add Project</button>
    </div>

    <div class="stats-section">
      <div class="stats-numbers">
        <div class="stat-item">
          <span class="stat-value">{{ projectsStore.projects.length }}</span>
          <span class="stat-label">Projects</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ allTasks.length }}</span>
          <span class="stat-label">Total Tasks</span>
        </div>
        <div class="stat-item">
          <span class="stat-value todo">{{
            allTasks.filter((task) => task.status === "todo").length
          }}</span>
          <span class="stat-label">To Do</span>
        </div>
        <div class="stat-item">
          <span class="stat-value progress">{{
            allTasks.filter((task) => task.status === "in_progress").length
          }}</span>
          <span class="stat-label">In Progress</span>
        </div>
        <div class="stat-item">
          <span class="stat-value done">{{
            allTasks.filter((task) => task.status === "done").length
          }}</span>
          <span class="stat-label">Done</span>
        </div>
      </div>
    </div>

    <div class="filters-bar">
      <div class="filter-group">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <circle
            cx="7"
            cy="7"
            r="5"
            stroke="currentColor"
            stroke-width="1.5"
          />
          <path
            d="M11 11l3 3"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
          />
        </svg>
        <input type="text" placeholder="Search by name..." />
      </div>
      <div class="filter-group">
        <select
          @change="
            projectsStore.setFilterStatus(
              ($event.target as HTMLSelectElement).value as ProjectStatus,
            )
          "
          :value="projectsStore.filterStatus"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </div>

    <div v-if="projectsStore.loading" class="loading">
      <div class="spinner"></div>
      <p>loading projects...</p>
    </div>

    <div class="data-table-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>move</th>
            <th v-for="column in columns" :key="column.key">
              <div>
                <span>{{ column.label }}</span>
              </div>
            </th>
          </tr>
        </thead>
      </table>
    </div>

    <AppModal :show="showModal" title="New Project" @close="showModal = false">
      <ProjectForm @submit="handleCreate" @cancel="showModal = false" />
    </AppModal>
  </div>
</template>

<style lang="scss" scoped>
@use "@/views/ProjectsView/ProjectsView.scss";
</style>
