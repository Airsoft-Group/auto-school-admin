import { ref, computed } from 'vue';
import type { CourseFilters } from '../types';

export function useCourseFilters() {
    const filters = ref<CourseFilters>({
        search: '',
        sortBy: 'date',
        sortDirection: 'desc'
    });

    const categories = ref<string[]>([]);
    const loading = ref(false);

    // Apply filters and store in URL query params
    const applyFilters = () => {
        // Implementation to apply filters to URL or fetch data
    };

    // Reset filters to default values
    const resetFilters = () => {
        filters.value = {
            search: '',
            sortBy: 'date',
            sortDirection: 'desc'
        };
    };

    // Computed property for active filter count
    const activeFilterCount = computed(() => {
        let count = 0;
        if (filters.value.search) count++;
        if (filters.value.category) count++;
        if (filters.value.minPrice || filters.value.maxPrice) count++;
        return count;
    });

    return {
        filters,
        categories,
        loading,
        activeFilterCount,
        applyFilters,
        resetFilters
    };
}