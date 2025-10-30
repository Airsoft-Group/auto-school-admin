<template>
    <div class="course-card" :class="{ 'is-featured': featured }">
      <div class="course-card__image">
        <img :src="course.imageUrl || '/placeholder-course.jpg'" :alt="course.title">
        <span v-if="course.price === 0" class="course-card__badge course-card__badge--free">
          Bepul
        </span>
      </div>
      
      <div class="course-card__content">
        <div class="course-card__category">{{ course.category }}</div>
        <h3 class="course-card__title">{{ course.title }}</h3>
        <p class="course-card__description">{{ truncatedDescription }}</p>
        
        <div class="course-card__meta">
          <div class="course-card__lessons">
            <icon-lessons class="icon" />
            {{ course.lessonsCount }} dars
          </div>
          
          <div v-if="course.rating" class="course-card__rating">
            <icon-star class="icon" />
            {{ course.rating.toFixed(1) }}
          </div>
        </div>
      </div>
      
      <div class="course-card__footer">
        <div class="course-card__price">
          {{ course.price === 0 ? 'Bepul' : formatPrice(course.price) }}
        </div>
        
        <el-button 
          class="course-card__button" 
          type="primary" 
          @click="viewCourse"
        >
          Ko'rish
        </el-button>
      </div>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import type { Course } from '../types';
  
  const props = defineProps<{
    course: Course;
    featured?: boolean;
  }>();
  
  const router = useRouter();
  
  const truncatedDescription = computed(() => {
    return props.course.description.length > 100
      ? `${props.course.description.substring(0, 97)}...`
      : props.course.description;
  });
  
  function formatPrice(price: number): string {
    return new Intl.NumberFormat('uz-UZ', { 
      style: 'currency', 
      currency: 'UZS',
      maximumFractionDigits: 0
    }).format(price);
  }
  
  function viewCourse() {
    router.push(`/courses/${props.course.id}`);
  }
  </script>
  
  <style lang="scss" scoped>
  .course-card {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    background-color: #fff;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    }
    
    &__image {
      position: relative;
      height: 160px;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    
    &__badge {
      position: absolute;
      top: 12px;
      right: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      
      &--free {
        background-color: #4CAF50;
        color: white;
      }
    }
    
    &__content {
      padding: 16px;
    }
    
    &__category {
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    
    &__title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #333;
    }
    
    &__description {
      font-size: 14px;
      color: #666;
      margin-bottom: 16px;
      line-height: 1.5;
    }
    
    &__meta {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #666;
      
      .icon {
        margin-right: 4px;
        font-size: 16px;
      }
    }
    
    &__footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-top: 1px solid #eee;
    }
    
    &__price {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    
    &.is-featured {
      border: 2px solid #1867C0;
    }
  }
  </style>