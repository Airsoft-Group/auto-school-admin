<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-semibold text-gray-800">Subjects</h2>
            <el-button type="primary" @click="openCreateModal">+ Add Subject</el-button>
        </div>
        <el-table style="width: 100%" class="whiteStripe" :data="subjects.data" v-loading="loading">
            <el-table-column label="№" width="80" align="center" :index="indexMethod" type="index" />
            <el-table-column label="Name (O‘zbekcha)" prop="name.oz" min-width="200" align="left">
                <template #default="{ row }">
                    {{ row.name?.oz }}
                </template>
            </el-table-column>
            <el-table-column label="Name (Кирил)" prop="name.uz" min-width="200" align="left">
                <template #default="{ row }">
                    {{ row.name?.uz }}
                </template>
            </el-table-column>
            <el-table-column label="Name (Русский)" prop="name.ru" min-width="200" align="left">
                <template #default="{ row }">
                    {{ row.name?.ru }}
                </template>
            </el-table-column>

            <el-table-column label="Actions" width="160" align="center">
                <template #default="{ row }">
                    <div class="flex items-center justify-center gap-2">
                        <el-button size="small" type="primary" plain @click="openEditModal(row)">
                            <el-icon><EditPen /></el-icon>
                        </el-button>
                        <el-button size="small" type="danger" plain @click="confirmDelete(row)">
                            <el-icon><DeleteFilled /></el-icon>
                        </el-button>
                    </div>
                </template>
            </el-table-column>
        </el-table>
        <div class="flex justify-end mt-4">
            <el-pagination
                background
                layout="prev, pager, next, jumper"
                :page-size="pagination.limit"
                :total="pagination.total"
                v-model:current-page="pagination.page"
                @current-change="handlePageChange"
            />
        </div>
        <!-- Create/Edit Modal -->
        <el-dialog :title="isEditing ? 'Edit Subject' : 'Add Subject'" v-model="isModalOpen" width="500px">
            <div>
                <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-position="top" v-loading="TransLoading">
                    <el-form-item label="Name (O‘zbekcha)" prop="name.oz" class="relative">
                        <el-input v-model="ruleForm.name.oz" placeholder="Masalan: Matematika" />
                        <button
                            :disabled="!ruleForm.name.oz"
                            type="button"
                            @click="translateTitle"
                            :class="ruleForm.name.oz ? 'text-[#326CFF] cursor-pointer' : 'text-gray-400 cursor-not-allowed'"
                            class="absolute right-3 top-[-35px] flex items-center justify-center"
                            title="Translate"
                        >
                            Translate 🌐
                        </button>
                    </el-form-item>

                    <el-form-item label="Name (Кирил)" prop="name.uz">
                        <el-input v-model="ruleForm.name.uz" placeholder="Математика" />
                    </el-form-item>

                    <el-form-item label="Name (Русский)" prop="name.ru">
                        <el-input v-model="ruleForm.name.ru" placeholder="Математика" />
                    </el-form-item>
                </el-form>
            </div>

            <div class="flex items-center justify-between gap-3 mt-4">
                <el-button class="w-full" size="large" @click="isModalOpen = false"> Cancel </el-button>
                <el-button class="w-full" size="large" type="primary" @click="submitForm(ruleFormRef)">
                    {{ isEditing ? 'Save Changes' : 'Add Subject' }}
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script lang="ts" setup>
import { useQuestionStore } from '@/stores/questions'
import { useSubjectStore } from '@/stores/subjects'
import { DeleteFilled, EditPen } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { debounce } from 'lodash'
const subjectStore = useSubjectStore()
const subjects = computed(() => subjectStore.subject)
const questionStore = useQuestionStore()
const translateData = computed(() => questionStore.translate)
const loading = ref(false)
const isModalOpen = ref(false)
const isEditing = ref(false)
const ruleFormRef = ref<FormInstance>()
const editingId = ref<string | null>(null)
const ruleForm = reactive({
    name: {
        oz: '',
        uz: '',
        ru: '',
    },
})
const pagination = reactive({
    total: 0,
    page: 1,
    limit: 20,
    lastPage: 1,
})

const rules = reactive<FormRules>({
    'name.oz': [{ required: true, message: 'O‘zbekcha nom kiritish majburiy', trigger: 'blur' }],
    'name.uz': [{ required: true, message: 'Кириллча ном кiритиш мажбурий', trigger: 'blur' }],
    'name.ru': [{ required: true, message: 'Введите русское название', trigger: 'blur' }],
})

const indexMethod = (index: number) => {
    return (pagination.page - 1) * pagination.limit + (index + 1)
}
const TransLoading = ref(false)
const translateTitle = debounce(async () => {
    const text = ruleForm.name.oz
    if (!text) return

    try {
        TransLoading.value = true

        const payload = {
            text,
            sourceLanguage: 'uz',
        }
        await questionStore.fetchTranslateText(payload)
        ruleForm.name.oz = translateData?.value?.data?.translations?.oz
        ruleForm.name.uz = translateData?.value?.data?.translations?.uz
        ruleForm.name.ru = translateData?.value?.data?.translations?.ru
    } catch (err) {
        console.error(err)
        ElMessage.error('Translation failed')
    } finally {
        TransLoading.value = false
    }
}, 500)
onMounted(() => {
    fetchList()
})

const fetchList = async () => {
    try {
        loading.value = true
        await subjectStore.fetchSubjects({ page: pagination.page, limit: pagination.limit } as any)
        const meta = subjects.value?.meta?.pagination as any
        if (meta) {
            pagination.total = meta.total
            pagination.page = meta.page
            pagination.limit = meta.limit
            pagination.lastPage = meta.lastPage
        }
    } finally {
        loading.value = false
    }
}

const handlePageChange = async (newPage: number) => {
    pagination.page = newPage
    await fetchList()
}

function openCreateModal() {
    isEditing.value = false
    resetForm()
    isModalOpen.value = true
}

function openEditModal(subject: any) {
    isEditing.value = true
    editingId.value = subject.id
    Object.assign(ruleForm, {
        name: {
            oz: subject.name?.oz ?? '',
            uz: subject.name?.uz ?? '',
            ru: subject.name?.ru ?? '',
        },
    })
    isModalOpen.value = true
}

function resetForm() {
    ruleForm.name.oz = ''
    ruleForm.name.uz = ''
    ruleForm.name.ru = ''
}

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate(async (valid) => {
        if (!valid) return
        try {
            loading.value = true
            if (isEditing.value && editingId.value) {
                await subjectStore.updateSubject(editingId.value, {
                    name: ruleForm.name,
                })
                ElMessage.success('Subject updated successfully')
            } else {
                await subjectStore.createSubject({ name: ruleForm.name })
                ElMessage.success('Subject created successfully')
            }
            await fetchList()
            isModalOpen.value = false
        } catch (error) {
            console.error(error)
            ElMessage.error('Error while saving subject')
        } finally {
            loading.value = false
        }
    })
}

function confirmDelete(subject: any) {
    ElMessageBox.confirm(`Are you sure you want to delete "${subject.name?.oz}"?`, 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning',
    })
        .then(async () => {
            loading.value = true
            await subjectStore.deleteSubject(subject.id)
            ElMessage.success('Subject deleted successfully')
            await fetchList()
            loading.value = false
        })
        .catch((error: any) => {
            console.log(error)
            ElMessage.error('Subject deleted error')
        })
}
</script>
