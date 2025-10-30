<template>
  <div class="course-list-page">
    <div class="course-list-page__header">
      <h1>{{ $t('courses.title') }}</h1>
      
      <el-button 
        v-if="hasPermission('create:courses')" 
        type="primary" 
        @click="showCreateCourse"
      >
        {{ $t('courses.create') }}
      </el-button>
    </div>
    
    <CourseFilters
      v-model="filters"
      :loading="loading"
      @filter="fetchCourses"
      @reset="resetFilters"
    />
    
    <el-row :gutter="24" class="course-grid">
      <el-col 
        v-for="course in courses" 
        :key="course.id" 
        :xs="24" 
        :sm="12" 
        :md="8" 
        :lg="6"
      >
        <CourseCard 
          :course="course" 
          :featured="featuredCourseIds.includes(course.id)" 
        />
      </el-col>
    </el-row>
    
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>
    
    <el-empty 
      v-else-if="courses.length === 0" 
      :description="$t('courses.empty')"
    />
    
    <el-dialog
      v-model="showDialog"
      :title="isEditing ? $t('courses.edit') : $t('courses.create')"
      width="600px"
    >
      <CourseForm
        v-if="showDialog"
        :course="currentCourse"
        :loading="saveLoading"
        @save="saveCourse"
        @cancel="cancelEdit"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { ElMessage } from 'element-plus';

import { 
  CourseCard, 
  CourseForm, 
  CourseFilters,
  useCourseStore,
  useCourseFilters,
  type Course, 
  type CourseFilters as Filters
} from '@/features/courses';

import { usePermissions } from '@/composables/usePermissions';

const { t } = useI18n();
const courseStore = useCourseStore();
const { hasPermission } = usePermissions();
const { filters, resetFilters } = useCourseFilters();

const showDialog = ref(false);
const isEditing = ref(false);
const currentCourse = ref<Partial<Course> | null>(null);
const saveLoading = ref(false);
const featuredCourseIds = ref<string[]>([]);

const courses = computed(() => courseStore.filteredCourses);
const loading = computed(() => courseStore.loading);

onMounted(async () => {
  await fetchCourses();
  fetchFeaturedCourses();
});

async function fetchCourses() {
  try {
    await courseStore.fetchCourses(filters.value);
  } catch (error) {
    ElMessage.error(t('courses.fetchError'));
  }
}

async function fetchFeaturedCourses() {
  featuredCourseIds.value = ['course-1', 'course-3'];
}

function showCreateCourse() {
  currentCourse.value = {};
  isEditing.value = false;
  showDialog.value = true;
}

function editCourse(course: Course) {
  currentCourse.value = { ...course };
  isEditing.value = true;
  showDialog.value = true;
}

async function saveCourse(course: any) {
  saveLoading.value = true;
  
  try {
    if (isEditing.value) {
      await courseStore.updateCourse(course);
      ElMessage.success(t('courses.updateSuccess'));
    } else {
      await courseStore.createCourse(course);
      ElMessage.success(t('courses.createSuccess'));
    }
    showDialog.value = false;
  } catch (error) {
    ElMessage.error(isEditing.value 
      ? t('courses.updateError') 
      : t('courses.createError'));
  } finally {
    saveLoading.value = false;
  }
}

function cancelEdit() {
  showDialog.value = false;
}
</script>

<style lang="scss" scoped>
.course-list-page {
  padding: 24px;
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    h1 {
      margin: 0;
      font-size: 24px;
    }
  }
  
  .course-grid {
    margin-top: 24px;
    
    .el-col {
      margin-bottom: 24px;
    }
  }
  
  .loading-container {
    padding: 24px 0;
  }
}
</style>