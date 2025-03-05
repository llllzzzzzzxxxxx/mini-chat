<template>
    <div>
        <router-view />
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
router.push('/login')
</script>

<style scoped lang="scss">
</style>