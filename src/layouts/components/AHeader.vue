<template>
    <header class="flex flex-col gap-5">
        <div>
            <h4 class="text-gray-900 font-semibold text-2xl">
                {{ currentRoute.title }}
            </h4>
            <p class="text-gray-600 text-base">
                {{ currentRoute.desc }}
            </p>
        </div>
        
        <!-- Action bar with search and add button -->
        <div class="flex items-center justify-between" v-if="showActions">
            <div class="relative max-w-md w-full">
                <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg class="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                </div>
                <input 
                    type="search" 
                    class="block w-full p-2.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-primary focus:border-primary" 
                    :placeholder="searchPlaceholder"
                    v-model="searchQuery"
                />
            </div>
            
            <el-button 
                type="primary" 
                class="flex items-center gap-2" 
                @click="onAddButtonClick"
            >
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                {{ addButtonText }}
            </el-button>
        </div>
    </header>
</template>
  
<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { routesMeta } from '@/constants/routes.constants'

const route = useRoute()
const router = useRouter()
const searchQuery = ref('')

// Get current route metadata
const currentRoute = computed(() => {
    
    return route.meta
})

// Show actions (search + add button) based on route
const showActions = computed(() => {
    const path = route.path.split('/')[1]
    return ['teachers', 'students', 'groups', 'courses'].includes(path)
})

// Dynamic button and search placeholder text based on route
const addButtonText = computed(() => {
    const path = route.path.split('/')[1]
    const buttonTexts: Record<string, string> = {
        teachers: "Ustoz qo'shish",
        students: "O'quvchi qo'shish",
        groups: "Guruh qo'shish",
        courses: "Kurs qo'shish"
    }
    return buttonTexts[path] || "Qo'shish"
})

const searchPlaceholder = computed(() => {
    const path = route.path.split('/')[1]
    const placeholders: Record<string, string> = {
        teachers: "Qidirish",
        students: "Qidirish",
        groups: "Qidirish",
        courses: "Qidirish"
    }
    return placeholders[path] || "Qidirish"
})

// Handle add button click
const onAddButtonClick = () => {
    const path = route.path.split('/')[1]
    router.push(`/${path}/add`)
}
</script>