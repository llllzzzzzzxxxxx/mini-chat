<template>
    <div>
        <div class="group-list">
            <!-- 遍历排序后的用户列表 -->
            <div class="group-list-item" v-for="(item, index) in sortedUserList" :key="index"
                @click="handleGroupClick(item)">
                <div class="group-list-item-avatar">
                    <img v-if="item.avatar" :src="item.avatar" alt="">
                    <Avatar v-else :name="item.name" :size="31" />
                    <!-- 在线状态小绿原点 -->
                    <div v-if="item.isOnline" class="online-dot"></div>
                </div>
                <div class="group-list-item-name">
                    {{ item.name }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { listMap, onlineWeb } from '@/api/user'
import type { UserMapResponse, UserMapItem } from '@/types/user'
import { useUserStore } from '@/stores/module/useUserStore'
import { useMessageStore } from '@/stores/module/useMessageStore'
import { useChatListStore } from '@/stores/module/useChatListStore'
import Avatar from '@/components/Avatar.vue'
import { ElMessage } from 'element-plus'
import EventBus from '@/utils/eventBus'

const userStore = useUserStore()
const messageStore = useMessageStore()
const chatListStore = useChatListStore()

// 存储包含用户是否在线信息的列表
const userListWithOnlineStatus = ref<(UserMapItem & { isOnline: boolean })[]>([])
// 存储排序后的用户列表
const sortedUserList = ref<(UserMapItem & { isOnline: boolean })[]>([])

// 对用户列表进行排序，在线用户在前，离线用户在后
const sortUserList = () => {
    sortedUserList.value = userListWithOnlineStatus.value.sort((a, b) => {
        if (a.isOnline && !b.isOnline) {
            return -1
        }
        if (!a.isOnline && b.isOnline) {
            return 1
        }
        return 0
    })
}

// 更新用户在线状态
const updateUserOnlineStatus = async () => {
    try {
        const res = await onlineWeb()
        if (res.code === 0) {
            const onlineUserIds = res.data
            userListWithOnlineStatus.value.forEach(user => {
                user.isOnline = onlineUserIds.includes(user.id)
            })
            sortUserList()
        }
    } catch (error) {
        console.error('获取在线用户列表失败', error)
    }
}

// 处理接收到的 WebSocket 通知
const handleWsNotify = (data: any) => {
    if (data.type === 'notify') {
        const { type, content } = data.content
        const userInfo = JSON.parse(content)
        const userIndex = userListWithOnlineStatus.value.findIndex(u => u.id === userInfo.id)
        if (userIndex !== -1) {
            if (type === 'web-online') {
                userListWithOnlineStatus.value[userIndex].isOnline = true
            } else if (type === 'web-offline') {
                userListWithOnlineStatus.value[userIndex].isOnline = false
            }
            sortUserList()
        }
    }
}

const handleGroupClick = (item: UserMapItem) => {
    try {
        chatListStore.createChat(item.id, item.name)
    } catch (error: any) {
        ElMessage.error(error.message || '创建聊天失败')
        return
    }
    messageStore.setTargetId(item.id)
    messageStore.setChatName(item.name)
    chatListStore.fetchAllChats()
}

onMounted(() => {
    userStore.getUserMap()
    EventBus.on('on-receive-msg', handleWsNotify)
    // 初始化用户列表，默认都为离线状态
    watch(() => userStore.userMap, async (newUserMap) => {
        userListWithOnlineStatus.value = Object.values(newUserMap).map(user => ({ ...user, isOnline: false }))
        await updateUserOnlineStatus()
    }, { immediate: true })
})

onUnmounted(() => {
    EventBus.off('on-receive-msg', handleWsNotify)
})
</script>

<style scoped lang="scss">
.group-list {
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: center;

    .group-list-item {
        display: flex;
        width: 100%;
        height: 40px;
        border-radius: 5px;
        transition: all 0.3s ease;
        padding-top: 5px;
        border-bottom: 1px solid #fff;
        padding-left: 10px;
        align-items: center;
        position: relative;

        &:hover {
            background-color: #fff;
            cursor: pointer;
        }

        img {
            width: 30px;
        }

        .online-status {
            color: #24E68A;
            margin-left: 10px;
        }

        .offline-status {
            color: red;
            margin-left: 10px;
        }

        .group-list-item-avatar {
            position: relative;

            .online-dot {
                position: absolute;
                bottom: 0;
                right: 0;
                width: 10px;
                height: 10px;
                background-color: #24E68A;
                border-radius: 50%;
            }
        }
        .group-list-item-name{
            margin-left: 10px;
        }
    }

}
</style>