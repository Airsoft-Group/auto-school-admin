import { ref, Ref } from 'vue';
import { FormInstance, ElMessage } from 'element-plus';

interface UseFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<any>;
  onSuccess?: () => void;
  successMessage?: string;
  errorMessage?: string;
}

export default function useForm<T extends object>(options: UseFormOptions<T>) {
  const {
    initialValues,
    onSubmit,
    onSuccess,
    successMessage = 'Operation completed successfully',
    errorMessage = 'Operation failed'
  } = options;

  const form = ref<T>({ ...initialValues }) as Ref<T>;
  const loading = ref(false);
  const formRef = ref<FormInstance>();

  const resetForm = () => {
    if (formRef.value) {
      formRef.value.resetFields();
      form.value = { ...initialValues };
    }
  };

  const submitForm = async (validateFunc?: () => boolean | Promise<boolean>) => {
    try {
      // Custom validation if provided
      if (validateFunc) {
        const isValid = await validateFunc();
        if (!isValid) return;
      } 
      // Element Plus form validation
      else if (formRef.value) {
        await formRef.value.validate();
      }

      loading.value = true;
      await onSubmit(form.value);
      ElMessage.success(successMessage);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Form submission error:', error);
      ElMessage.error(errorMessage);
      return false;
    } finally {
      loading.value = false;
    }
    
    return true;
  };

  return {
    form,
    loading,
    formRef,
    resetForm,
    submitForm
  };
}
