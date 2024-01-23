<script setup>
import { watch } from 'vue';

const props = defineProps({
    title: {
        type: String,
        required: true
    },
})
watch(() => props.title, () => {
    document.title = props.title
})
document.title = props.title
</script>
<template>
    <!-- Empty template https://github.com/vuejs/vue/issues/12281#issuecomment-930013742-->
</template>