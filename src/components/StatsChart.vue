<script setup lang="ts">
import { computed } from "vue";
import { Doughnut } from "vue-chartjs";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import type { Task } from "@/types";

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  tasks: Task[];
}>();

console.log(props.tasks, " props.tasks");

const chartData = computed(() => {
  const counts = { todo: 0, in_progress: 0, done: 0 };
  props.tasks.forEach((t) => {
    if (counts[t.status] !== undefined) counts[t.status]++;
  });
  return {
    labels: ["To Do", "In Progress", "Done"],
    datasets: [
      {
        data: [counts.todo, counts.in_progress, counts.done],
        backgroundColor: ["rgba(245, 158, 11, 0.8)", "rgba(99, 102, 241, 0.8)", "rgba(74, 222, 128, 0.8)"],
        borderColor: ["rgba(245, 158, 11, 1)", "rgba(99, 102, 241, 1)", "rgba(74, 222, 128, 1)"],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: "bottom" as const,
      labels: {
        color: "#94a3b8",
        padding: 10,
        usePointStyle: true,
        pointStyleWidth: 17,
        font: {
          family: "Inter",
          size: 12,
        },
      },
    },
    tooltip: {
      backgroundColor: "rgba(15, 15, 26, 0.9)",
      titleColor: "#e2e8f0",
      bodyColor: "#94a3b8",
      borderColor: "rgba(255, 255, 255, 0.08)",
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
    },
  },
  cutout: "65%",
};
</script>

<template>
  <div class="chart-wrapper">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variables" as *;

.chart-wrapper {
  max-width: 240px;
  margin: 0 auto;

  @media (max-width: $breakpoint-sm) {
    max-width: 200px;
    flex-direction: column;
  }
}
</style>
