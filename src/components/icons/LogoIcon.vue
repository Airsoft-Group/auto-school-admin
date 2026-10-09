<template>
    <router-link to="/" :class="['flex items-center gap-2.5 no-underline', $props.class]">
        <img src="/favicon.svg" alt="AvtoSchool" class="w-10 h-10 shrink-0" />
        <span class="text-xl font-extrabold text-gray-800 whitespace-nowrap">Avto<span class="text-primary">School</span></span>
    </router-link>
</template>
<script lang="ts">
export default {
    name: 'LogoIcon',
    props: {
        class: {
            type: String,
            default: '',
        },
    },
}
</script>
