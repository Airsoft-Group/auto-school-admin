<template>
    <svg :class="class" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 20l9-5-9-5-9 5 9 5z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 12l9-5-9-5-9 5 9 5z" />
    </svg>
</template>
<script lang="ts">
export default {
    name: 'TopicIcon',
    props: {
        class: {
            type: String,
            default: '',
        },
    },
}
</script>
