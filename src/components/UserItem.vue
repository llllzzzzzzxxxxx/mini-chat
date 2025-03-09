<template>
    <div class="main-right-header" @click="showUserInfo = true">
        <div v-if="userStore.user?.avatar" class="main-right-header-left">
            <img :src="userStore.user?.avatar" alt="">
        </div>
        <div v-else class="main-right-header-left">
            <Avatar :name="userStore.user?.userName || ''" :size="40" />
        </div>
        <div v-if="userStore.user" class="main-right-header-right">
            <p>{{ userStore.user.userName }}</p>
        </div>

    </div>
    <div class="logout" @click="handleLogout">
        <svg t="1741253243728" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
            p-id="4020" width="32" height="32">
            <path
                d="M960.512 539.712l-144.768 144.832-48.256-48.256 60.224-60.288H512V512h325.76l-70.272-70.272 48.256-48.256 144.768 144.768-0.704 0.768 0.704 0.704zM704 192a64 64 0 0 0-64-64H192a64 64 0 0 0-64 64v640a64 64 0 0 0 64 64h448a64 64 0 0 0 64-64v-64h64v64a128 128 0 0 1-128 128H192a128 128 0 0 1-128-128V192a128 128 0 0 1 128-128h448a128 128 0 0 1 128 128v128h-64V192z"
                p-id="4021"></path>
        </svg>
    </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/module/useUserStore'
import { ref } from 'vue'
import Avatar from './Avatar.vue'
const userStore = useUserStore()

const showUserInfo = ref(false)
const handleLogout = () => {
    userStore.logout()
}
</script>

<style scoped lang="scss">
.main-right-header {
    width: 50%;
    display: flex;
    align-items: center;
    cursor: pointer;
    justify-content: space-around;

    .main-right-header-left {
        flex: 1;
    }

    .main-right-header-right {
        flex: 1;
    }

}

.logout {
    cursor: pointer;
}
</style>