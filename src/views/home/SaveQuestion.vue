<template>
    <div class="w-full p-6">
        <div class="flex flex-col items-start justify-start gap-3 mb-6">
            <el-button type="text" @click="router.push('/')" class="!p-0 text-gray-600 hover:text-blue-600 transition">
                <el-icon><ArrowLeft /></el-icon>
                <span class="ml-1 text-sm text-left">{{ $t('app.back') }}</span>
            </el-button>
            <h2 class="text-2xl font-bold text-gray-800">{{ $t('app.saved_question') }}</h2>
        </div>

        <div v-if="loading" class="space-y-4">
            <el-card v-for="n in 8" :key="n" class="p-2 md:p-4" shadow="never">
                <div class="flex justify-between items-center">
                    <div class="flex-1">
                        <el-skeleton :rows="1" animated style="width: 50%" />
                    </div>
                    <el-skeleton animated style="width: 80px; height: 24px" />
                </div>
            </el-card>
        </div>
        <div
            v-else-if="!savedQuestions?.data?.length"
            class="flex flex-col items-center justify-center py-16 text-center bg-white rounded-xl shadow-sm"
        >
            <img src="https://cdn-icons-png.flaticon.com/512/4076/4076503.png" class="w-28 h-28 opacity-70 mb-4" alt="No data" />
            <p class="text-gray-700 font-semibold text-lg">{{ t('app.no_save_data') }}</p>
            <p class="text-gray-500 text-sm mt-1">{{ t('app.no_save_data_2') }}</p>
        </div>
        <div v-else>
            <div v-for="(item, index) in savedQuestions?.data" :key="item.id" class="p-5 border rounded-xl shadow-sm bg-white mb-3">
                <div class="mb-4">
                    <p class="text-[#] font-bold text-lg mb-4">{{ index + 1 }}. {{ item.question?.title?.[lang] || 'Savol yuklanmoqda...' }}</p>
                </div>
                <div class="grid md:gap-6 md:grid-cols-3 grid-cols-1">
                    <div class="mb-4">
                        <div class="space-y-3 mb-4">
                            <div
                                v-for="(option, i) in item.question?.answers || []"
                                :key="option.id"
                                class="flex items-center gap-3 border rounded-lg px-4 py-3 transition-all cursor-pointer"
                            >
                                <span class="font-semibold min-w-[40px] bg-[#0061FF] w-[40px] h-[40px] flex items-center text-white justify-center"
                                    >F{{ i + 1 }}.</span
                                >
                                <span class="">{{ option.title?.[lang] }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="col-span-2">
                        <div class="p-5 mb-4 flex flex-col overflow-hidden shadow-sm border border-[#fff] rounded-xl">
                            <img
                                v-if="item.question?.file?.path"
                                :src="getImageUrl(item.question.file.path)"
                                :alt="item.question.file.name || 'Question Image'"
                                class="w-full h-[400px] object-contain rounded-lg"
                            />
                            <img v-else :src="DefaultImage" alt="" class="w-full h-[400px] object-contain rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { useQuestionStore } from '@/stores/questions'
import { ArrowLeft } from '@element-plus/icons-vue'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import DefaultImage from '@/assets/images/default-image.svg'
import { useRouter } from 'vue-router'
const questionStore = useQuestionStore()
const savedQuestions = computed(() => questionStore.savedQuestion)
const router = useRouter()
const { t, locale } = useI18n()
const lang = computed<'uz' | 'oz' | 'ru'>(() => {
    return locale.value as 'uz' | 'oz' | 'ru'
})
const loading = ref(true)
const currentPage = ref(1)

const getImageUrl = (path: string): string => {
    if (!path) return ''
    return path.startsWith('http') ? path : `https://timedu.uz${path}`
}
const fetchPage = async (page: any) => {
    loading.value = true
    await questionStore.fetchSavedQuestion({ page } as any)
    currentPage.value = page
    loading.value = false
}
onMounted(() => {
    fetchPage(1)
})
</script>
