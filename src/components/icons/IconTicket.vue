<template>
    <svg :class="class" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <rect x="3" y="4" width="18" height="16" rx="2" ry="2" stroke-width="2" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18" />
    </svg>
</template>
<script lang="ts">
export default {
    name: 'TicketIcon',
    props: {
        class: {
            type: String,
            default: '',
        },
    },
}
</script>
