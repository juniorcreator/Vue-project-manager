<script setup lang="ts" generic="T extends Record<string, any>">
import { computed, reactive, ref, watch } from "vue";
import type { SortOrder, TableColumn } from "@/types";
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
    console.log(saved);
    if (saved) Object.assign(savedWidths, JSON.parse(saved));
  } catch (err) {
    console.error("Failed to ger col-widths", err);
  }
}
const columnsState = reactive(
  props.columns.map((column) => ({
    ...column,
    width: savedWidths[column.key] ?? column.width ?? 150,
  })),
);
const currentSortOrder = computed(() => props.sortOrder);
console.log(currentSortOrder, "currentSortOrder");
const localRows = ref<T[]>([...props.rows]) as import("vue").Ref<T[]>;
const tbodyRef = ref<HTMLElement | null>(null);
console.log(columnsState, " columnsState");

useSortable(tbodyRef, ref([]), {
  handle: ".drag-handle",
  animation: 200,
  ghostClass: "ghost",
  onEnd: (evt: any) => {
    const { oldIndex, newIndex, item } = evt;

    if (oldIndex === undefined || newIndex === undefined || oldIndex === newIndex) {
      return;
    }

    const parent = item.parentNode;
    if (parent) {
      if (oldIndex < newIndex) {
        parent.insertBefore(item, parent.children[oldIndex]);
      } else {
        parent.insertBefore(item, parent.children[oldIndex + 1] || null);
      }
    }

    const newRows = [...localRows.value];
    console.log(newRows, " newRows");
    const [moved] = newRows.splice(oldIndex, 1);
    newRows.splice(newIndex, 0, moved);

    emit("reorder", newRows);
  },
});
console.log(localRows.value, " localRows");
watch(
  () => props.rows,
  (newRows) => {
    console.log(newRows, "watch newRows on props.rows");
    localRows.value = [...newRows];
  },
);
const rowKey = (row: T): string | number => {
  return row[(props.rowKeyField as keyof T) || ("id" as keyof T)] as string;
};
const toggleSort = (key: string) => {
  let newOrder: SortOrder = "asc";
  if (props.sortKey === key) {
    if (props.sortOrder === "asc") newOrder = "desc";
    else if (props.sortOrder === "desc") newOrder = null;
  }
  emit("sort", key, newOrder);
};

let resizeIndex = -1;
let startX = 0;
let startWidth = 0;

const startResize = (e: MouseEvent, index: number) => {
  resizeIndex = index;
  startX = e.clientX;
  startWidth = columnsState[index].width;
  document.addEventListener("mousemove", onResize);
  document.addEventListener("mouseup", stopResize);
};

const saveColumnWidths = () => {
  if (!props.storageKey) return;
  const widths: Record<string, number> = {};
  for (const col of columnsState) {
    widths[col.key] = col.width;
  }
  localStorage.setItem(`col-widths-${props.storageKey}`, JSON.stringify(widths));
};

const onResize = (e: MouseEvent) => {
  if (resizeIndex < 0) return;
  const diff = e.clientX - startX;
  const minWidth = columnsState[resizeIndex].minWidth || 80;
  columnsState[resizeIndex].width = Math.max(minWidth, startWidth + diff);
};
const stopResize = () => {
  resizeIndex = -1;
  document.removeEventListener("mousemove", onResize);
  document.removeEventListener("mouseup", stopResize);
  saveColumnWidths();
};
</script>

<template>
  <div class="data-table-wrapper">
    <div class="table-scroll" ref="tableScroll">
      <table class="data-table">
        <thead>
          <tr>
            <th class="col-drag" style="width: 20px">
              <i class="pi pi-arrows-v"></i>
            </th>
            <th
              v-for="(col, index) in columnsState"
              :key="col.key"
              :style="{
                width: col.width + 'px',
                minWidth: (col.minWidth || 80) + 'px',
              }"
              :class="{ sortable: col.sortable, sorted: sortKey === col.key }"
            >
              <div @click="col.sortable && toggleSort(col.key)" class="th-content">
                <span>{{ col.label }}</span>
                <span v-if="col.sortable" class="sort-icon">
                  <i v-if="sortKey === col.key && currentSortOrder === 'asc'" class="pi pi-sort-up"></i>
                  <i
                    v-else-if="sortKey === col.key && currentSortOrder === 'desc'"
                    class="pi pi-sort-down"
                  ></i>
                  <i v-else class="pi pi-sort"></i>
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
              <i class="pi pi-sort-alt-slash"></i>
            </td>
            <td
              v-for="col in columnsState"
              :key="col.key"
              :style="{
                width: col.width + 'px',
                minWidth: (col.minWidth || 80) + 'px',
              }"
            >
              <slot :name="'cell-' + col.key" :row="element" :value="element[col.key]">
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

.col-resize-handle {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: 1;

  &:after {
    content: "";
    position: absolute;
    right: 2px;
    top: 15%;
    bottom: 15%;
    width: 3px;
    background: $border-color;
    border-radius: 1px;
    transition: background 150ms ease;
  }

  &:hover::after {
    background: $accent-primary;
  }
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

  .col-drag {
    width: 40px;
    min-width: 40px;
    text-align: center;
  }

  .th-content {
    display: inline-block;
  }

  @media (max-width: $breakpoint-sm) {
    table-layout: auto;
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

.table-empty {
  text-align: center;
  padding: $space-10;
  color: $text-muted;
  font-size: $font-size-sm;
}

:deep(.ghost) {
  opacity: 0.4;
  background: rgba(99, 102, 241, 0.1);
}

:deep(.sortable-chosen) {
  background: $bg-card-hover;
}
</style>
