<template>
    <div>
        <div class="header">
            <div class="header-left">
                <div class="header-left-title">
                    <p>消息列表</p>
                </div>
            </div>
            <div class="header-center">
                <div class="header-center-title">  
                    <ChatName/>
                </div>
            </div>
            <div class="header-right">
                <UserItem />
            </div>
        </div>
        <div class="main">
            <div class="main-left">
                <ChatList></ChatList>
            </div>
            <div class="main-center">
                <Message></Message>
            </div>
            <div class="main-right">
                <GroupList></GroupList>
            </div>
        </div>

        <!-- 用户信息编辑弹窗 -->
        <UserInfo v-model="showUserInfo" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/module/useUserStore'
import { logout } from '@/api/login'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/types/common'
import UserInfo from '@/components/UserInfo.vue'
import ChatList from '@/components/ChatList.vue'
import Message from '@/components/Message.vue'
import ChatName from '@/components/ChatName.vue'
import UserItem from '@/components/UserItem.vue'
import GroupList from '@/components/GroupList.vue'
const router = useRouter()
const userStore = useUserStore()
const showUserInfo = ref(false)

// 处理退出登录
const handleLogout = async () => {
    try {
        const res = await logout() as ApiResponse
        // 清除用户信息
        userStore.clearUser()
        // 清除token
        localStorage.removeItem('x-token')
        localStorage.removeItem('user')
        ElMessage.success('退出成功')
        // 跳转到登录页
        router.push('/login')

    } catch (error: any) {
        ElMessage.error(error.message || '退出失败，请稍后重试')
    }
}
</script>

<style scoped lang="scss">
.header {
    width: 100%;
    height: 70px;
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    align-items: center;
    justify-content: center;
    gap: 5px;
    grid-template-areas: "left center right";

    // background-color: #9b2525;
    .header-left {
        grid-area: left;
        border: #ffffff 3px solid;
        width: 100%;
        height: 100%;
        border-radius: 5px;
        display: flex;
        font-family: 'PingFang SC';
        justify-content: center;
        align-items: center;
        font-size: 19px;
        font-weight: 550;
        color: black;
        background: #EDF5FE;
    }

    .header-center {
        grid-area: center;
        border: #ffffff 3px solid;
        width: 100%;
        border-radius: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        background: #EFF5FD;
    }

    .header-right {
        color: #000;
        grid-area: right;
        width: 100%;
        border: #ffffff 3px solid;
        border-radius: 5px;
        display: flex;
        justify-content: space-around;
        align-items: center;
        height: 100%;
        background: #EFF5FD;

        
    }
}

.main {
    width: 100%;
    height: calc(100vh - 200px);
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
    grid-template-areas: "left center right";
    gap: 5px;

    // background-color: #000;
    .main-left {
        border-radius: 5px;
        border: #ffffff 3px solid;
        margin-top: 5px;
        grid-area: left;
        background: #EDF5FE;
    }

    .main-center {
        grid-area: center;
        border: #ffffff 3px solid;
        margin-top: 5px;
        border-radius: 5px;
        background: #E8F0FB;
    }

    .main-right {
        margin-top: 5px;
        border: #ffffff 3px solid;
        border-radius: 5px;
        grid-area: right;
        background: #EDF5FE;
    }
}
</style>