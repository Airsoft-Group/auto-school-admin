<template>
    <el-container class="layout-container">
        <el-menu default-active="5" class="el-menu-vertical-demo h-full" :collapse="isCallapse">
            <Sidebar class="h-full w-[280px] overflow-hidden" :isCallapse="isCallapse" @toggle="isCallapse = !isCallapse" />
        </el-menu>
        <el-container class="content-wrapper">
            <el-scrollbar class="layout-main-scrollbar" ref="mainScrollbarRef">
                <div class="w-full px-4">
                    <el-main class="layout-main">
                        <router-view v-slot="{ Component }">
                            <transition name="slide-right" mode="out-in">
                                <component :is="Component" />
                            </transition>
                        </router-view>
                    </el-main>
                </div>
            </el-scrollbar>
        </el-container>
    </el-container>
</template>

<script setup lang="ts">
import Sidebar from './components/ASidebar.vue'
import Header from './components/AHeader.vue'
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const isCallapse = ref(false)
const currentRoute = computed(() => router.currentRoute.value.fullPath.split('/')[1] || 'default')
</script>

<style scoped lang="scss">
.layout-container .layout-main {
    overflow: hidden;
    width: 100%;
    height: 100%;
}
.layout-main-scrollbar {
    width: 100%;
    position: relative;
    height: 100vh;
    // overflow: scroll;
}
.layout-container {
    height: 100%;
    width: 100%;
    display: flex;
}
.content-wrapper {
    width: 100%;
    height: 100%;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 280px;
    min-height: 300px;
    border: none;
}
</style>
