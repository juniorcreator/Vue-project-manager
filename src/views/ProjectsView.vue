<script setup lang="ts">
import { ref, onMounted } from "vue";
import { projectsApi } from "@/api/projects.ts";
import { tasksApi } from "@/api/tasks.ts";
import { useProjectsStore } from "@/stores/projects.ts";
import type { Task } from "@/types";
import { columns } from "@/constants/table.ts";

const projectsStore = useProjectsStore();
const allTasks = ref<Task[]>([]);

onMounted(async () => {
  await projectsStore.fetchProjects();

  try {
    const { data } = await tasksApi.getAll();
    allTasks.value = data;
  } catch {
    console.error("onMounted error occurred");
  }
});
</script>
<template>
  <div class="container">
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
          <span class="stat-value">{{
            allTasks.filter((task) => task.status === "todo").length
          }}</span>
          <span class="stat-label">To Do</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{
            allTasks.filter((task) => task.status === "in_progress").length
          }}</span>
          <span class="stat-label">In Progress</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{
            allTasks.filter((task) => task.status === "done").length
          }}</span>
          <span class="stat-label">Done</span>
        </div>
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
  </div>
</template>

<style lang="scss" scoped>
.stats-section {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  margin-bottom: 10px;
  align-items: center;
}
.stats-numbers {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.stat-item {
  background: rebeccapurple;
  padding: 15px;
  text-align: center;
  flex: 1;
  min-width: 100px;
}
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 20px;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.08);
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
