<script setup>
import { ref } from 'vue';
import { setI18nLanguage, getPreferredLanguage } from '../i18n'
import { watch } from 'vue';

const preferredLanguage = ref(getPreferredLanguage())
watch(preferredLanguage, (newValue) => setI18nLanguage(newValue)) 
</script>
<template>
    <select v-model="preferredLanguage">
        <option value="en">🇬🇧 English</option>
        <option value="fr">🇫🇷 Français</option>
    </select>
</template>
<style scoped>
select {
    pointer-events: auto;
}
</style>