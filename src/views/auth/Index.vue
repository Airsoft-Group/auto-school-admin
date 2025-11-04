<template>
    <div class="min-h-screen">
        <div class="h-[95vh] flex items-center justify-center">
            <img class="w-[50%] h-full object-fill" src="@/assets/images/driving-school-animate.svg" alt="auto-school" />
            <div class="box w-full">
                <div class="text-center mx-auto w-full max-w-[370px]">
                    <LogoIcon class="mx-auto fixed top-8 left-8 max-w-[120px]" />
                    <h5 class="font-bold text-3xl text-primary">{{ $t('auth.login_title') }}</h5>
                    <p class="text-base mb-6 mt-1 text-[#212121] opacity-50">
                        {{ $t('auth.login_description') }}
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
                            <div class="text-left text-sm font-medium mb-1">{{ $t('auth.login_label') }}</div>
                            <el-form-item prop="email" class="mb-4">
                                <el-input v-model.trim="ruleForm.email" type="text" autocomplete="off" :placeholder="$t('auth.login_placeholder')" />
                            </el-form-item>
                        </div>

                        <div class="mb-4">
                            <div class="text-left text-sm font-medium mb-1">{{ $t('auth.password_label') }}</div>
                            <el-form-item prop="password">
                                <el-input
                                    v-model.trim="ruleForm.password"
                                    type="password"
                                    :show-password="true"
                                    autocomplete="off"
                                    :placeholder="$t('auth.password_placeholder')"
                                />
                            </el-form-item>
                        </div>

                        <div class="flex flex-col py-1 mt-4">
                            <el-button class="w-full" size="large" type="primary" @click="submitForm(ruleFormRef)" :loading="loading">
                                {{ $t('auth.login_button') }}
                            </el-button>
                            <div class="text-center mt-3 text-sm text-gray-600">
                                {{ $t('auth.or_text') }}
                                <router-link to="/" class="text-primary font-bold hover:underline">{{ $t('auth.back_to_home') }}</router-link>
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
import { useI18n } from 'vue-i18n'
const store = useUserStore()
const router = useRouter()
const ruleFormRef = ref<FormInstance>()
const { t } = useI18n()
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
            message: t('validation.email_required'),
            trigger: 'blur',
        },
    ],
    password: [
        {
            required: true,
            message: t('validation.password_required'),
            trigger: 'blur',
        },
        {
            min: 6,
            message: t('validation.password_min'),
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
                        message: t('messages.login_success'),
                        type: 'success',
                    })
                    if (store.getUser?.role === 'super_admin') {
                        router.push('/admin/dashboard')
                    } else {
                        router.push('/')
                    }
                } else {
                    // Handle API error response format
                    const errorMessage = response.message || response.error?.details || t('messages.login_error')
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
