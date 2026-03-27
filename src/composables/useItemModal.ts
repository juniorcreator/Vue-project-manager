import { ref } from "vue";

export const useItemModal = <T>() => {
  const showModal = ref(false);
  const showDeleteModal = ref(false);
  const editingItem = ref<T | null>(null);
  const itemToDelete = ref<T | null>(null);

  const openModal = (item: T | null = null) => {
    editingItem.value = item as T;
    showModal.value = true;
  };

  const closeModal = () => {
    showModal.value = false;
    editingItem.value = null;
  };

  const confirmDelete = (item: T) => {
    itemToDelete.value = item as T;
    showDeleteModal.value = true;
  };

  const closeDeleteModal = () => {
    showDeleteModal.value = false;
    itemToDelete.value = null;
  };

  return {
    showModal,
    showDeleteModal,
    editingItem,
    itemToDelete,
    openModal,
    closeModal,
    confirmDelete,
    closeDeleteModal,
  };
};
