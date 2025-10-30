// Export public API of the courses feature
import { useCourseStore } from './store';
import CourseCard from './components/CourseCard.vue';
import CourseForm from './components/CourseForm.vue';
import CourseFilters from './components/CourseFilters.vue';
import { useCourseFilters } from '@/features/courses/composables/useCourseFilters';

import courseService from './services/index.service';

// Export everything through a single entry point
export {
    // Components
    CourseCard,
    CourseForm,
    CourseFilters,

    // Composables
    useCourseFilters,

    // Store
    useCourseStore,

    // Service
    courseService
};

// Also re-export types
export * from './types';