<template>
    <el-dialog v-model="show" :title="title" :width="width" :before-close="hideModal">
        <div id="modal"></div>
    </el-dialog>
    <router-view></router-view>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import iconfontInit from '@/utils/iconfont'
import { useModal } from '@/composables'
const { show, hideModal, title, width } = useModal()
onMounted(() => {
    iconfontInit()
})
</script>
