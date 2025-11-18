<template>
    <svg :class="class" xmlns="http://www.w3.org/2000/svg" :width="size" :height="size" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <!-- Bookmark outline -->
        <path
            d="M6 2.75C5.58579 2.75 5.25 3.08579 5.25 3.5V20.0607C5.25 20.6839 5.98345 21.0315 6.50528 20.693L12 17.25L17.4947 20.693C18.0166 21.0315 18.75 20.6839 18.75 20.0607V3.5C18.75 3.08579 18.4142 2.75 18 2.75H6Z"
            fill="currentColor"
        />
        <!-- Star inside (to indicate bookmarked / saved) -->
        <path
            d="M12 8.5l1.302 2.64 2.913.423-2.107 2.056.498 2.903L12 15.77l-2.606 1.742.498-2.903L7.785 11.563l2.913-.423L12 8.5z"
            fill="white"
            opacity="0.95"
        />
    </svg>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'BookMarkedIcon',
    props: {
        class: {
            type: String,
            default: '',
        },
        size: {
            type: [Number, String],
            default: 20,
        },
    },
})
</script>
