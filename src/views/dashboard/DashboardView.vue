<template>
    <div class="">
        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-semibold text-gray-800">Users</h2>
            <el-button type="primary" @click="openCreateModal">+ Add User</el-button>
        </div>

        <!-- Table -->
        <el-table style="width: 100%" class="whiteStripe" row-class-name="cursor-pointer" :data="users.data" v-loading="loading">
            <el-table-column type="index" label="№" width="80" align="center" />
            <el-table-column prop="fullName" label="Name" min-width="200" />
            <el-table-column prop="role" label="Role" min-width="200" />
            <el-table-column prop="email" label="Email" min-width="220" />
            <el-table-column prop="accessStartAt" label="Access start" min-width="220">
                <template #default="{ row }">
                    {{ dayjs(row.accessStartAt).format('YYYY-MM-DD') }}
                </template>
            </el-table-column>
            <el-table-column prop="accessEndAt" label="Access end" min-width="220">
                <template #default="{ row }">
                    {{ dayjs(row.accessEndAt).format('YYYY-MM-DD') }}
                </template>
            </el-table-column>
            <el-table-column label="Password" min-width="180" align="center">
                <template #default="{ row }">
                    <div class="flex items-center justify-center gap-2">
                        <span class="font-mono text-gray-700">
                            {{ row.showPassword ? row.password : maskPassword(row.password) }}
                        </span>

                        <el-tooltip :content="row.showPassword ? 'Hide password' : 'Show password'" placement="top">
                            <el-button size="small" text @click="togglePassword(row)">
                                <el-icon v-if="row.showPassword" color="#333">
                                    <View />
                                </el-icon>
                                <el-icon v-else color="#666" class="rotate-180 opacity-70">
                                    <View />
                                </el-icon>
                            </el-button>
                        </el-tooltip>
                    </div>
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

        <!-- Create/Edit Modal -->
        <el-dialog :title="isEditing ? 'Edit User' : 'Add User'" v-model="isModalOpen" width="450px">
            <div>
                <el-form
                    ref="ruleFormRef"
                    :model="ruleForm"
                    :rules="rules"
                    label-position="top"
                    require-asterisk-position="right"
                    @keyup.enter="submitForm(ruleFormRef)"
                    v-loading="loading"
                >
                    <el-form-item label="Name" prop="fullName">
                        <el-input v-model="ruleForm.fullName" placeholder="Enter fullname" />
                    </el-form-item>
                    <el-form-item label="Email" prop="email">
                        <el-input v-model="ruleForm.email" placeholder="Enter email" />
                    </el-form-item>
                    <el-form-item label="Password" prop="password">
                        <el-input v-model="ruleForm.password" placeholder="Enter password" />
                    </el-form-item>
                    <el-form-item label="From date" prop="accessStartAt">
                        <el-date-picker
                            v-model="ruleForm.accessStartAt"
                            type="date"
                            placeholder="Select start date"
                            format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD"
                            style="width: 100%"
                        />
                    </el-form-item>

                    <el-form-item label="To date" prop="accessEndAt">
                        <el-date-picker
                            v-model="ruleForm.accessEndAt"
                            type="date"
                            placeholder="Select end date"
                            format="YYYY-MM-DD"
                            value-format="YYYY-MM-DD"
                            style="width: 100%"
                        />
                    </el-form-item>
                </el-form>
            </div>
            <div class="flex items-center justify-between gap-3">
                <el-button class="w-full" size="large" @click="isModalOpen = false">Cancel</el-button>
                <el-button class="w-full" size="large" type="primary" @click="submitForm(ruleFormRef)">
                    {{ isEditing ? 'Save Changes' : 'Add User' }}
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { dayjs, ElMessage, ElMessageBox, FormInstance, FormRules } from 'element-plus'
import { useUserManagementStore } from '@/stores'
import { DeleteFilled, EditPen, View } from '@element-plus/icons-vue'

const usersStore = useUserManagementStore()
const users = computed(() => usersStore.users)
const viewPassword = computed(() => usersStore.password)
const loading = ref(false)
const isModalOpen = ref(false)
const isEditing = ref(false)
const ruleFormRef = ref<FormInstance>()
const editingId = ref<string | null>(null)
const maskPassword = (password: string) => '•'.repeat(8)
const ruleForm = reactive({
    fullName: '',
    email: '',
    password: '',
    accessStartAt: '',
    accessEndAt: '',
})

const validateEndDate = (rule: any, value: string, callback: any) => {
    if (!value) {
        return callback(new Error('To date is required'))
    }
    if (ruleForm.accessStartAt && new Date(value) < new Date(ruleForm.accessStartAt)) {
        return callback(new Error('To date must be after From date'))
    }
    callback()
}

const rules = reactive<FormRules>({
    fullName: [{ required: true, message: 'Name is required', trigger: 'blur' }],
    email: [
        { required: true, message: 'Email is required', trigger: 'blur' },
        { type: 'email', message: 'Invalid email format', trigger: ['blur', 'change'] },
    ],
    password: [
        { required: true, message: 'Password is required', trigger: 'blur' },
        { min: 6, message: 'Password must be at least 6 characters', trigger: 'blur' },
    ],
    accessStartAt: [{ required: true, message: 'From date is required', trigger: 'change' }],
    accessEndAt: [
        { required: true, message: 'To date is required', trigger: 'change' },
        { validator: validateEndDate, trigger: 'change' },
    ],
})

onMounted(() => {
    fetchList()
})

const fetchList = async () => {
    await usersStore.fetchUsers()
}

function openCreateModal() {
    isEditing.value = false
    resetForm()
    isModalOpen.value = true
}

const togglePassword = async (row: any) => {
    if (row.showPassword) {
        row.showPassword = false
        row.password = '********'
        return
    }
    try {
        loading.value = true
        await usersStore.viewPassword(row.id)
        row.password = viewPassword.value?.data?.plainPassword
        row.showPassword = true
    } catch (err) {
        ElMessage.error('Failed to fetch password')
    } finally {
        loading.value = false
    }
}

function openEditModal(user: any) {
    isEditing.value = true
    editingId.value = user.id ?? null
    Object.assign(ruleForm, {
        fullName: user.fullName,
        email: user.email,
        password: '',
        accessStartAt: user.accessStartAt || '',
        accessEndAt: user.accessEndAt || '',
    })
    isModalOpen.value = true
}

function resetForm() {
    ruleForm.fullName = ''
    ruleForm.email = ''
    ruleForm.password = ''
    ruleForm.accessEndAt = ''
    ruleForm.accessStartAt = ''
}

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate(async (valid) => {
        if (valid) {
            try {
                loading.value = true

                if (isEditing.value && editingId.value) {
                    await usersStore.updateUser(editingId.value, {
                        fullName: ruleForm.fullName,
                        email: ruleForm.email,
                        password: ruleForm.password,
                        accessStartAt: ruleForm.accessStartAt,
                        accessEndAt: ruleForm.accessEndAt,
                    })
                    ElMessage.success('User updated successfully')
                } else {
                    await usersStore.createUser({ ...ruleForm })
                    ElMessage.success('User created successfully')
                }

                await fetchList()
                isModalOpen.value = false
                loading.value = false
            } catch (error: any) {
                console.log('error', error)
                loading.value = false
            }
        }
    })
}

function confirmDelete(user: any) {
    ElMessageBox.confirm(`Are you sure you want to delete "${user.name}"?`, 'Warning', {
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        type: 'warning',
    })
        .then(async () => {
            loading.value = true
            await usersStore.deleteUser(user.id)
            ElMessage.success('User deleted successfully')
            await fetchList()
            loading.value = false
        })
        .catch((error: any) => {
            console.log(error)
            ElMessage.error('User deleted error')
        })
}
</script>
