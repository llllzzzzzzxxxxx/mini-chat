<template>
    <div class="chat-list">
        <!-- 群聊部分 -->
        <div class="chat-section">
            <div class="section-title">群聊</div>
            <div v-for="chat in groupChats" :key="chat.id" class="chat-item" @click="handleChatClick(chat)">
                <div class="chat-avatar">
                    <Avatar :name="chat.targetInfo.name" :size="40" />
                    <div v-if="chat.unreadCount > 0" class="unread-badge">
                        {{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}
                    </div>
                </div>
                <div class="chat-info">
                    <div class="chat-header">
                        <span class="chat-name">{{ chat.targetInfo.name }}</span>
                        <span class="chat-time">{{ formatTime(chat.updateTime) }}</span>
                    </div>
                    <div class="chat-message">
                        {{ chat.lastMessage?.message || '暂无消息' }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 私聊部分 -->
        <div class="chat-section">
            <div class="section-title">私聊</div>
            <div v-for="chat in privateChats" :key="chat.id" class="chat-item" @click="handleChatClick(chat)">
                <div class="chat-avatar">
                    <Avatar :name="chat.targetInfo.name" :size="40" />
                    <div v-if="chat.unreadCount > 0" class="unread-badge">
                        {{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}
                    </div>
                </div>
                <div class="chat-info">
                    <div class="chat-header">
                        <span class="chat-name">{{ chat.targetInfo.name }}</span>
                        <span class="chat-time">{{ formatTime(chat.updateTime) }}</span>
                    </div>
                    <div class="chat-message">
                        {{ chat.lastMessage?.message || '暂无消息' }}
                    </div>
                </div>
            </div>
        </div>

        <div v-if="chatList.length === 0" class="empty-list">
            <el-empty description="暂无聊天消息" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { group, privateList } from '@/api/chatList'
import type { ChatListItem } from '@/types/chatList'
import { ElMessage } from 'element-plus'
import { formatTime } from '@/utils/date'
import Avatar from '@/components/Avatar.vue'
import { useMessageStore } from '@/stores/module/useMessageStore'

const chatList = ref<ChatListItem[]>([])
const messageStore = useMessageStore()

// 计算群聊和私聊列表
const groupChats = computed(() =>
    chatList.value.filter(chat => chat.type === 'group')
        .sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime())
)

const privateChats = computed(() =>
    chatList.value.filter(chat => chat.type === 'private')
        .sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime())
)

// 获取所有聊天列表
const fetchAllChats = async () => {
    try {
        // 获取群聊列表
        const groupRes = await group()
        // 获取私聊列表
        const privateRes = await privateList()

        if (groupRes.code === 0 && privateRes.code === 0) {
            const groupChats = Array.isArray(groupRes.data) ? groupRes.data : [groupRes.data]
            const privateChats = Array.isArray(privateRes.data) ? privateRes.data : [privateRes.data]
            console.log('群聊数据:', groupChats)
            console.log('私聊数据:', privateChats)
            // 合并两个列表
            chatList.value = [...groupChats, ...privateChats]

            // 如果有群聊，自动设置第一个群聊的targetId
            if (groupChats.length > 0) {
                messageStore.setTargetId(groupChats[0].targetId)
            }
        } else {
            ElMessage.error('获取聊天列表失败')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '获取聊天列表失败')
    }
}

// 点击聊天项
const handleChatClick = (chat: ChatListItem) => {
    console.log('点击的聊天targetId:', chat.targetId)
    messageStore.setTargetId(chat.targetId)
    console.log('设置后的store targetId:', messageStore.targetId)
}

// 定义事件
// const emit = defineEmits<{
//     (e: 'select-chat', chat: ChatListItem): void
// }>()

onMounted(() => {
    fetchAllChats()
})
</script>

<style scoped lang="scss">
.chat-list {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    background: #fff;
    border-radius: 8px;
    padding: 10px 0;

    .chat-section {
        margin-bottom: 20px;

        &:last-child {
            margin-bottom: 0;
        }

        .section-title {
            padding: 0 15px;
            font-size: 14px;
            color: #909399;
            margin-bottom: 10px;
            font-weight: 500;
        }
    }

    .chat-item {
        display: flex;
        align-items: center;
        padding: 10px 15px;
        cursor: pointer;
        transition: background-color 0.3s;

        &:hover {
            background-color: #f5f7fa;
        }

        .chat-avatar {
            position: relative;
            margin-right: 12px;

            .unread-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background-color: #f56c6c;
                color: white;
                border-radius: 10px;
                padding: 0 6px;
                font-size: 12px;
                min-width: 16px;
                height: 16px;
                line-height: 16px;
                text-align: center;
            }
        }

        .chat-info {
            flex: 1;
            overflow: hidden;

            .chat-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 4px;

                .chat-name {
                    font-size: 16px;
                    font-weight: 500;
                    color: #303133;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .chat-time {
                    font-size: 12px;
                    color: #909399;
                }
            }

            .chat-message {
                font-size: 14px;
                color: #606266;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
        }
    }

    .empty-list {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

// 自定义滚动条样式
.chat-list::-webkit-scrollbar {
    width: 6px;
}

.chat-list::-webkit-scrollbar-thumb {
    background-color: #dcdfe6;
    border-radius: 3px;
}

.chat-list::-webkit-scrollbar-track {
    background-color: transparent;
}
</style>