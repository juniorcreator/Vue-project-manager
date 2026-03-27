# ProjectFlow — Project & Task Management SPA

[**🚀 Live Demo**]() *([Vercel link to be added here](https://vue-project-manager.vercel.app/projects/3))*

A modern, responsive Single Page Application for managing projects and tasks, built with Vue.js 3, TypeScript, and Pinia.

## Features

- **Dashboard** — Projects overview with doughnut chart (task distribution) and summary statistics
- **Projects Table** — Sortable, filterable, resizable columns with drag-and-drop row reordering
- **Project Detail** — Table and Kanban board views with toggle
- **Kanban Board** — Drag-and-drop cards between To Do / In Progress / Done columns
- **CRUD Operations** — Create, edit, and manage projects and tasks via modals with form validation
- **Real-time Filtering** — Search and status filtering with instant results
- **State Persistence** — User preferences (view mode, sort/filter settings) persist via LocalStorage
- **Toast Notifications** — Auto-dismissing feedback for all CRUD operations

## Tech Stack

| Technology    | Purpose                    |
|---------------|----------------------------|
| Vue.js 3      | UI framework (Composition API) |
| TypeScript    | Type safety                |
| Pinia         | State management           |
| Vue Router    | Client-side routing        |
| Axios         | HTTP client                |
| sortablejs    | Drag-and-drop              |
| Chart.js      | Data visualization         |
| SCSS          | Styling                    |
| mockapi.io    | Mock REST API              |
| Vite          | Build tool                 |

## Local Launch Instructions

### Prerequisites

- Node.js 18+
- npm 9+

### 1. Installation

```bash
npm install
```

### 2. Running Locally

Start the dev server:

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173)

### 3. Build for Production

```bash
npm run build
npm run preview
```

## Deployment Process (Vercel)

This application is optimized for deployment on Vercel:

1. Push your code to a GitHub, GitLab, or Bitbucket repository.
2. Log in to [Vercel](https://vercel.com/) and click **Add New** -> **Project**.
3. Import your Git repository.
4. Vercel will automatically detect the **Vite** framework and configure the correct settings:
    - **Build Command:** `npm run build`
    - **Output Directory:** `dist`
5. Click **Deploy**. Your application will be built and deployed automatically.

## Project Structure

```
src/
├── api/             # Axios instance & API services
├── assets/scss/     # Design system (variables, mixins, main.scss)
├── components/      # Reusable UI components
│   ├── AppModal.vue
│   ├── DataTable.vue
│   ├── KanbanBoard.vue
│   ├── ProjectForm.vue
│   ├── StatusBadge.vue
│   ├── StatsChart.vue
│   └── TaskForm.vue
├── router/          # Vue Router config
├── stores/          # Pinia stores (projects, tasks)
├── types/           # TypeScript interfaces
└── views/           # Page-level components
    ├── ProjectsView.vue
    └── ProjectDetailView.vue
```
