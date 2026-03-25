import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "projects",
      component: () => import("@/views/ProjectsView.vue"),
    },
    {
      path: "/projects/:id",
      name: "projects-detail",
      component: () => import("@/views/ProjectDetailView.vue"),
    },
  ],
});

export default router;
