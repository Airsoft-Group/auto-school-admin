import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

interface UseCrudTableOptions {
  fetchItems: (params?: any) => Promise<any>;
  deleteItem: (id: string) => Promise<any>;
  itemName?: string;
}

export default function useCrudTable(options: UseCrudTableOptions) {
  const { fetchItems, deleteItem, itemName = 'item' } = options;

  const items = ref<any[]>([]);
  const loading = ref(false);
  const totalItems = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(10);

  const loadItems = async () => {
    loading.value = true;
    try {
      const response = await fetchItems({
        page: currentPage.value,
        pageSize: pageSize.value
      });
      
      // Adjust based on your API response structure
      items.value = response.items || response.data || response;
      totalItems.value = response.total || response.length || 0;
    } catch (error) {
      console.error('Error loading items:', error);
      ElMessage.error(`Failed to load ${itemName}s`);
    } finally {
      loading.value = false;
    }
  };

  const handlePageChange = (page: number) => {
    currentPage.value = page;
    loadItems();
  };

  const handleSizeChange = (size: number) => {
    pageSize.value = size;
    currentPage.value = 1;
    loadItems();
  };

  const handleDelete = async (id: string) => {
    try {
      await ElMessageBox.confirm(
        `Are you sure you want to delete this ${itemName}?`,
        'Warning',
        {
          confirmButtonText: 'Yes',
          cancelButtonText: 'No',
          type: 'warning',
        }
      );
      
      loading.value = true;
      await deleteItem(id);
      loadItems();
    } catch (error) {
      if (error !== 'cancel') {
        console.error('Error deleting item:', error);
        ElMessage.error(`Failed to delete ${itemName}`);
      }
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    loadItems();
  });

  return {
    items,
    loading,
    totalItems,
    currentPage,
    pageSize,
    loadItems,
    handlePageChange,
    handleSizeChange,
    handleDelete
  };
}
