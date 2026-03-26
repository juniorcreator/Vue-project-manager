<script setup lang="ts">
import { projectsApi } from "@/api/projects.ts";
import { useProjectsStore } from "@/stores/projects.ts";
import { useRouter } from "vue-router";
import type { SortOrder, TableColumn } from "@/types";
import { computed, reactive, ref, watch } from "vue";
import { useSortable } from "@vueuse/integrations/useSortable";

const props = defineProps<{
  columns: TableColumn[];
  rows: T[];
  sortKey?: string | null;
  sortOrder?: SortOrder;
  isDraggable?: boolean;
  rowKeyField?: string | keyof T;
  storageKey?: string;
}>();

const emit = defineEmits<{
  sort: [key: string, order: SortOrder];
  rowClick: [row: T];
  reorder: [rows: T[]];
}>();

console.log(props, " props");

const savedWidths: Record<string, number> = {};
if (props.storageKey) {
  try {
    const saved = localStorage.getItem(`col-widths-${props.storageKey}`);
    if (saved) Object.assign(savedWidths, JSON.parse(saved));
  } catch (err) {
    console.error("Failed to ger col-widths", err);
  }
}
const router = useRouter();
const currentSortOrder = computed(() => props.sortOrder);
const projectsStore = useProjectsStore();
const localRows = ref<T[]>([...props.rows]) as import("vue").Ref<T[]>;
const tbodyRef = ref<HTMLElement | null>(null);

useSortable(tbodyRef, ref([]), {
  handle: ".drag-handle",
  animation: 200,
  ghostClass: "ghost",
  onEnd: (evt: any) => {
    const { oldIndex, newIndex, item } = evt;
    if (
      oldIndex === undefined ||
      newIndex === undefined ||
      oldIndex === newIndex
    )
      return;

    const parent = item.parentNode;
    if (parent) {
      if (oldIndex < newIndex) {
        parent.insertBefore(item, parent.children[oldIndex]);
      } else {
        parent.insertBefore(item, parent.children[oldIndex + 1] || null);
      }
    }

    // Mutate state manually
    const newRows = [...localRows.value];
    const [moved] = newRows.splice(oldIndex, 1);
    newRows.splice(newIndex, 0, moved);

    emit("reorder", newRows);
  },
});
console.log(localRows.value, " localRows");
watch(
  () => props.rows,
  (newVal) => {
    console.log(newVal, "watch newVal on props.rows");
    localRows.value = newVal;
  },
);

const toggleSort = (key: string) => {
  let newOrder: SortOrder = "asc";
  if (props.sortKey === key) {
    if (props.sortOrder === "asc") newOrder = "desc";
    else if (props.sortOrder === "desc") newOrder = null;
  }
  emit("sort", key, newOrder);
};
const rowKey = (row: T): string | number => {
  return row[(props.rowKeyField as keyof T) || ("id" as keyof T)] as
    | string
    | number;
};
const onDragEnd = () => {
  emit("reorder", [...localRows.value]);
};
const columnsState = reactive(
  props.columns.map((c) => ({
    ...c,
    width: savedWidths[c.key] ?? c.width ?? 150,
  })),
);
const saveColumnWidths = () => {
  if (!props.storageKey) return;
  const widths: Record<string, number> = {};
  for (const col of columnsState) {
    widths[col.key] = col.width;
  }
  localStorage.setItem(
    `col-widths-${props.storageKey}`,
    JSON.stringify(widths),
  );
};
const onResize = (e: MouseEvent) => {
  if (resizeIdx < 0) return;
  const diff = e.clientX - startX;
  const minW = columnsState[resizeIdx].minWidth || 80;
  columnsState[resizeIdx].width = Math.max(minW, startWidth + diff);
};
const stopResize = () => {
  resizeIdx = -1;
  document.removeEventListener("mousemove", onResize);
  document.removeEventListener("mouseup", stopResize);
  saveColumnWidths();
};

let resizeIdx = -1;
let startX = 0;
let startWidth = 0;
const startResize = (e: MouseEvent, idx: number) => {
  resizeIdx = idx;
  startX = e.clientX;
  startWidth = columnsState[idx].width;
  document.addEventListener("mousemove", onResize);
  document.addEventListener("mouseup", stopResize);
};
</script>

<template>
  <div class="data-table-wrapper">
    <div class="table-scroll" ref="tableScroll">
      <table class="data-table">
        <thead>
          <tr>
            <th
              v-if="isDraggable"
              class="col-drag"
              style="width: 40px; min-width: 40px"
            ></th>
            <th
              v-for="(col, index) in columnsState"
              :key="col.key"
              :style="{
                width: col.width + 'px',
                minWidth: (col.minWidth || 80) + 'px',
              }"
              :class="{ sortable: col.sortable, sorted: sortKey === col.key }"
              @click="col.sortable && toggleSort(col.key)"
            >
              <div class="th-content">
                <span>{{ col.label }}</span>
                <span v-if="col.sortable" class="sort-icon">
                  <svg
                    v-if="sortKey === col.key && currentSortOrder === 'asc'"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                  >
                    <path
                      d="M7 3v8M3 7l4-4 4 4"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <svg
                    v-else-if="
                      sortKey === col.key && currentSortOrder === 'desc'
                    "
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                  >
                    <path
                      d="M7 11V3M3 7l4 4 4-4"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <svg
                    v-else
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    class="sort-neutral"
                  >
                    <path
                      d="M5 6l2-2 2 2M5 8l2 2 2-2"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </div>
              <div
                v-if="index < columnsState.length - 1"
                class="col-resize-handle"
                @mousedown.prevent="startResize($event, index)"
              ></div>
            </th>
          </tr>
        </thead>
        <tbody ref="tbodyRef">
          <tr
            v-for="element in localRows"
            :key="rowKey(element)"
            class="table-row"
            :class="{ clickable: !!$attrs.onRowClick }"
            @click="$emit('rowClick', element)"
          >
            <td v-if="isDraggable" class="col-drag drag-handle">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                opacity="0.4"
              >
                <circle cx="6" cy="4" r="1.5" />
                <circle cx="10" cy="4" r="1.5" />
                <circle cx="6" cy="8" r="1.5" />
                <circle cx="10" cy="8" r="1.5" />
                <circle cx="6" cy="12" r="1.5" />
                <circle cx="10" cy="12" r="1.5" />
              </svg>
            </td>
            <td
              v-for="col in columnsState"
              :key="col.key"
              :style="{
                width: col.width + 'px',
                minWidth: (col.minWidth || 80) + 'px',
              }"
            >
              <slot
                :name="'cell-' + col.key"
                :row="element"
                :value="element[col.key]"
              >
                {{ element[col.key] }}
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="!rows.length" class="table-empty">
      <p>No data available</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use "@/assets/scss/variables" as *;
@use "@/assets/scss/mixins" as *;

.data-table-wrapper {
  @include glass-card;
  overflow-x: hidden;
}

.table-scroll {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;

  thead {
    background: rgba(255, 255, 255, 0.03);
    border-bottom: 1px solid $border-color;
  }

  th {
    position: relative;
    padding: $space-3 $space-4;
    text-align: left;
    font-size: $font-size-xs;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: $text-muted;
    user-select: none;
    white-space: nowrap;
    overflow: hidden;

    &.sortable {
      cursor: pointer;
      &:hover {
        color: $text-secondary;
      }
    }

    &.sorted {
      color: $accent-primary;
    }
  }

  td {
    padding: $space-3 $space-4;
    font-size: $font-size-sm;
    color: $text-secondary;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.table-row {
  cursor: pointer;
  transition: background 150ms ease;

  &:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  &.clickable {
    cursor: pointer;
    &:hover {
      background: rgba(99, 102, 241, 0.06);
    }
  }
}

.col-drag {
  width: 40px;
  min-width: 40px;
  text-align: center;
}
</style>
