<template>
    <div>
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-semibold text-gray-800">Tickets</h2>
            <el-button type="primary" @click="openCreateModal">+ Add Ticket</el-button>
        </div>
        <el-table style="width: 100%" class="whiteStripe" :data="tickets.data" v-loading="loading">
            <el-table-column label="№" width="80" align="center" :index="indexMethod" type="index" />
            <el-table-column label="Name" prop="name" min-width="200" align="left">
                <template #default="{ row }">
                    {{ row.name }}
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
        <el-dialog :title="isEditing ? 'Edit Ticket' : 'Add Ticket'" v-model="isModalOpen" width="500px">
            <div>
                <el-form ref="ruleFormRef" :model="ruleForm" :rules="rules" label-position="top" v-loading="loading">
                    <el-form-item label="Name" prop="name">
                        <el-input v-model="ruleForm.name" placeholder="Ticket" />
                    </el-form-item>
                </el-form>
            </div>

            <div class="flex items-center justify-between gap-3 mt-4">
                <el-button class="w-full" size="large" @click="isModalOpen = false"> Cancel </el-button>
                <el-button class="w-full" size="large" type="primary" @click="submitForm(ruleFormRef)">
                    {{ isEditing ? 'Save Changes' : 'Add Ticket' }}
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script lang="ts" setup>
import { useSubjectStore } from '@/stores/subjects'
import { useTicketStore } from '@/stores/ticket'
import { DeleteFilled, EditPen } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

const ticketStore = useTicketStore()
const tickets = computed(() => ticketStore.ticket)
const loading = ref(false)
const isModalOpen = ref(false)
const isEditing = ref(false)
const ruleFormRef = ref<FormInstance>()
const editingId = ref<string | null>(null)
const ruleForm = reactive({
    name: '',
})
const pagination = reactive({
    total: 0,
    page: 1,
    limit: 10,
    lastPage: 1,
})

const rules = reactive<FormRules>({
    name: [{ required: true, message: 'Ticket name required', trigger: 'blur' }],
})

const indexMethod = (index: number) => {
    return (pagination.page - 1) * pagination.limit + (index + 1)
}
onMounted(() => {
    fetchList()
})

const fetchList = async () => {
    try {
        loading.value = true
        await ticketStore.fetchTickets({ page: pagination.page, limit: pagination.limit })
        const meta = tickets.value?.meta?.pagination as any
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

function openEditModal(ticket: any) {
    isEditing.value = true
    editingId.value = ticket.id
    Object.assign(ruleForm, {
        name: ticket.name,
    })
    isModalOpen.value = true
}

function resetForm() {
    ruleForm.name = ''
}

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate(async (valid) => {
        if (!valid) return
        try {
            loading.value = true
            if (isEditing.value && editingId.value) {
                await ticketStore.updateTicket(editingId.value, {
                    name: ruleForm.name,
                })
                ElMessage.success('Ticket updated successfully')
            } else {
                await ticketStore.createTicket({
                    name: ruleForm.name,
                })
                ElMessage.success('Ticket created successfully')
            }
            await fetchList()
            isModalOpen.value = false
        } catch (error) {
            console.error(error)
            ElMessage.error('Error while saving ticket')
        } finally {
            loading.value = false
        }
    })
}

function confirmDelete(ticket: any) {
    ElMessageBox.confirm(`Are you sure you want to delete "${ticket.name}"?`, 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning',
    })
        .then(async () => {
            loading.value = true
            await ticketStore.deleteTicket(ticket.id)
            ElMessage.success('Ticket deleted successfully')
            await fetchList()
            loading.value = false
        })
        .catch((error: any) => {
            console.log(error)
            ElMessage.error('Ticket deleted error')
        })
}
</script>
