<template>
    <div class="min-h-screen">
        <div class="h-[95vh] flex items-center justify-center">
            <img class="w-[50%] h-full object-contain" :src="AutoSchoolImage" alt="auto-school" />
            <div class="box w-full">
                <div class="text-center mx-auto w-full max-w-[370px]">
                    <LogoIcon class="mx-auto fixed top-8 left-8 max-w-[120px]" />
                    <h5 class="font-bold text-3xl text-primary">Tizimga kirish</h5>
                    <p class="text-base mb-6 mt-1 text-[#212121] opacity-50">
                        Tizimga kirish uchun login va parolingizni <br />
                        kiriting
                    </p>

                    <el-form
                        @keyup.enter="submitForm(ruleFormRef)"
                        ref="ruleFormRef"
                        :model="ruleForm"
                        :rules="rules"
                        :hide-required-asterisk="true"
                        label-position="top"
                        class="!text-xs"
                    >
                        <div class="mb-4">
                            <div class="text-left text-sm font-medium mb-1">Login</div>
                            <el-form-item prop="email" class="mb-4">
                                <el-input v-model.trim="ruleForm.email" type="text" autocomplete="off" placeholder="Loginingizni kiriting" />
                            </el-form-item>
                        </div>

                        <div class="mb-4">
                            <div class="text-left text-sm font-medium mb-1">Parol</div>
                            <el-form-item prop="password">
                                <el-input
                                    v-model.trim="ruleForm.password"
                                    type="password"
                                    :show-password="true"
                                    autocomplete="off"
                                    placeholder="Parolingizni kiriting"
                                />
                            </el-form-item>
                        </div>

                        <div class="flex flex-col py-1 mt-4">
                            <el-button class="w-full" size="large" type="primary" @click="submitForm(ruleFormRef)" :loading="loading">
                                Tizimga kirish
                            </el-button>
                            <div class="text-center mt-3 text-sm text-gray-600">
                                yoki <router-link to="/" class="text-[#ff6c3f] hover:underline">Asosiy sahifaga qaytish</router-link>
                            </div>
                        </div>
                    </el-form>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { LogoIcon } from '@/components/icons'
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import AutoSchoolImage from '@/assets/images/auto-school.png'
const store = useUserStore()
const router = useRouter()
const ruleFormRef = ref<FormInstance>()

// Form data matching our new LoginRequest type
const ruleForm = reactive({
    email: '',
    password: '',
})

// Form validation rules
const rules = reactive<FormRules>({
    email: [
        {
            required: true,
            message: 'Iltimos, usernameingizni kiriting',
            trigger: 'blur',
        },
    ],
    password: [
        {
            required: true,
            message: 'Iltimos, parolingizni kiriting',
            trigger: 'blur',
        },
        {
            min: 6,
            message: `Parol kamida 6 ta belgidan iborat bo'lishi kerak`,
            trigger: 'blur',
        },
    ],
})

const loading = ref(false)

const submitForm = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate(async (valid) => {
        if (valid) {
            try {
                loading.value = true
                const response = await store.login({
                    email: ruleForm.email,
                    password: ruleForm.password,
                })
                if (response.success) {
                    await store.fetchUserInfo()
                    ElMessage({
                        message: 'Tizimga muvaffaqiyatli kirdingiz',
                        type: 'success',
                    })
                    if (store.getUser?.role === 'super_admin') {
                        router.push('/admin/dashboard')
                    } else {
                        router.push('/')
                    }
                } else {
                    // Handle API error response format
                    const errorMessage = response.message || response.error?.details || `Login yoki parol noto'g'ri`
                    ElMessage({
                        message: errorMessage,
                        type: 'error',
                    })
                }
            } catch (error: any) {
                // Extract error message from Axios error response format
                // const errorResponse = error.response?.data
                // const errorMessage = errorResponse?.message ||
                //                   (errorResponse?.error?.details) ||
                //                   error.message ||
                //                   `Login yoki parol noto'g'ri`
                // ElMessage({
                //     message: errorMessage,
                //     type: 'error',
                // })
            } finally {
                loading.value = false
            }
        }
    })
}
</script>

<style lang="scss" scoped>
.login-btn {
    border-radius: 6px;
    height: 48px;
    font-weight: 500;
}

:deep(.el-input__wrapper) {
    border-radius: 6px;
    padding: 10px 15px;
}
</style>
