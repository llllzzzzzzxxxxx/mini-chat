<template>
    <div class="chat-list">
        <!-- 群聊部分 -->
        <div class="chat-section">
            <div class="section-title">群聊</div>
            <div v-for="chat in chatListStore.groupChats" :key="chat.id" class="chat-item"
                :class="{ active: messageStore.targetId === chat.targetId }" @click="handleChatClick(chat)">
                <div class="chat-avatar">
                    <img v-if="chat.targetInfo.avatar" :src="chat.targetInfo.avatar" alt="">
                    <Avatar v-else :name="chat.targetInfo.name" :size="40" />
                    <div v-if="chat.unreadCount > 0" class="unread-badge">
                        {{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}
                    </div>
                </div>
                <div class="chat-info">
                    <div class="chat-header">
                        <span class="chat-name">{{ chat.targetInfo.name }}</span>
                        <span class="chat-time">{{ formatTime(chat.updateTime) }}</span>
                    </div>
                    <div v-if="chat.lastMessage.type === 'emoji'" class="chat-message">
                        [emoji]
                    </div>
                    <div v-else class="chat-message" :title="getLatestMessage(chat.targetId)">
                        {{ getLatestMessage(chat.targetId) }}
                    </div>
                </div>
            </div>
        </div>

        <!-- 私聊部分 -->
        <div class="chat-section">
            <div class="section-title">私聊</div>
            <div v-for="chat in chatListStore.privateChats" :key="chat.id" class="chat-item"
                :class="{ active: messageStore.targetId === chat.targetId }" @click="handleChatClick(chat)">
                <div class="chat-avatar">
                    <img v-if="chat.targetInfo.avatar" :src="chat.targetInfo.avatar" alt="">
                    <Avatar v-else :name="chat.targetInfo.name" :size="40" />
                    <div v-if="chat.unreadCount > 0" class="unread-badge">
                        {{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}
                    </div>
                </div>
                <div class="chat-info">
                    <div class="chat-header">
                        <span class="chat-name">{{ chat.targetInfo.name }}</span>
                        <span class="chat-time">{{ formatTime(chat.updateTime) }}</span>
                    </div>
                    <div v-if="chat.lastMessage.type === 'emoji'" class="chat-message">
                        [动画表情]
                    </div>
                    <div v-else-if="chat.lastMessage.type === 'text'" class="chat-message"
                        :title="getLatestMessage(chat.targetId)">
                        {{ getLatestMessage(chat.targetId) }}
                    </div>
                    <div v-else-if="chat.lastMessage.type === 'call'" class="chat-message">
                        {{ getLatestMessage(chat.targetId) }}
                    </div>
                </div>
            </div>
        </div>

        <div v-if="chatListStore.chatList.length === 0" class="empty-list">
            <el-empty description="暂无聊天消息" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { group, privateList } from '@/api/chatList'
import type { ChatListItem } from '@/types/chatList'
import type { MessageInfo } from '@/types/chatList'
import { ElMessage } from 'element-plus'
import { formatTime } from '@/utils/date'
import Avatar from '@/components/Avatar.vue'
import { useMessageStore } from '@/stores/module/useMessageStore'
import { useChatListStore } from '@/stores/module/useChatListStore'
import EventBus from '@/utils/eventBus'
import { useUserStore } from '@/stores/module/useUserStore'

const chatListStore = useChatListStore()
const messageStore = useMessageStore()
const userStore = useUserStore()

// 处理新消息更新聊天列表
const handleNewMessage = (content: any) => {
    let targetChat = null;
    console.log('content:chatList', content)
    // 根据消息类型和发送对象找到对应的聊天
    if (content.source === 'group') {
        // 群聊消息，根据toId（群ID）查找
        targetChat = chatListStore.chatList.find(chat =>
            chat.type === 'group' && chat.targetId === content.toId
        );
    } else {
        // 私聊消息，需要根据发送者和接收者判断
        const currentUserId = userStore.user?.userId.toString();
        console.log('currentUserId', currentUserId)
        // 如果我是发送者
        if (content.fromId === currentUserId) {
            targetChat = chatListStore.chatList.find(chat =>
                chat.type === 'user' && chat.targetId === content.toId
            );
        }
        // 如果我是接收者
        else if (content.toId === currentUserId) {
            targetChat = chatListStore.chatList.find(chat =>
                chat.type === 'user' && chat.targetId === content.fromId
            );
        }

        // 如果没有找到对应的聊天，可能需要创建新的聊天
        if (!targetChat && content.toId === currentUserId) {
            // 当收到新的私聊消息但没有对应的聊天时，刷新聊天列表
            chatListStore.fetchAllChats();
            return;
        }
    }

    // 如果找到对应的聊天
    if (targetChat) {
        // 如果不是当前聊天，增加未读消息数
        if (targetChat.targetId !== messageStore.targetId) {
            targetChat.unreadCount = (targetChat.unreadCount || 0) + 1;
        }
        chatListStore.readChat(targetChat.targetId)
        // 更新最后一条消息
        targetChat.lastMessage = {
            id: content.id,
            fromId: content.fromId,
            toId: content.toId,
            fromInfo: content.fromInfo,
            message: content.message,
            referenceMsg: content.referenceMsg,
            atUser: content.atUser,
            isShowTime: false,
            type: content.type,
            source: content.source,
            createTime: content.createTime,
            updateTime: content.updateTime
        } as MessageInfo;
        targetChat.updateTime = content.createTime;

        // 重新排序聊天列表
        chatListStore.chatList.sort((a, b) =>
            new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
        );
    }
}

// 点击聊天项
const handleChatClick = (chat: ChatListItem) => {
    messageStore.setTargetId(chat.targetId)
    messageStore.setChatName(chat.targetInfo.name)
    messageStore.source = chat.type
    chatListStore.readChat(chat.targetId)
}

// 获取最新消息内容
const getLatestMessage = (targetId: string): string => {
    const chat = chatListStore.chatList.find(item => item.targetId === targetId)
    if (!chat?.lastMessage.message) return '暂无消息'
    if(chat.lastMessage.type === 'call'){
        if(chat.lastMessage.message==='0')return '[未接通]';
        else return '[语音通话]';
    }
    try {
        if (typeof chat.lastMessage.message === 'string') {
            const messageObj = JSON.parse(chat.lastMessage.message)
            if (Array.isArray(messageObj)) {
                return messageObj.map(item => item.content || '').join('')
            }
            return chat.lastMessage.message
        }
        return JSON.stringify(chat.lastMessage)
    } catch {
        return chat.lastMessage.toString()
    }
}

onMounted(() => {
    chatListStore.fetchAllChats()
    // 监听新消息
    EventBus.on('on-receive-msg', handleNewMessage)
})
onBeforeUnmount(() => {
    // 移除事件监听
    EventBus.off('on-receive-msg', handleNewMessage)
})
</script>

<style scoped lang="scss">
.chat-list {
    width: 100%;
    height: 100%; 
    /* 确保高度为固定值或有最大高度限制，超出部分显示滚动条 */
    max-height: 600px; 
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

    .active {
        background-color: #0090F0;
    }

    .chat-item {
        display: flex;
        align-items: center;
        padding: 12px;
        cursor: pointer;
        transition: background-color 0.3s;
        border-bottom: 1px solid #f0f0f0;

        &:hover:not(.active) {
            background-color: #f5f5f5;
        }

        &.active {
            border-radius: 8px;

            .chat-name {
                color: #fff !important;
            }

            .chat-time {
                color: #fff !important;
            }

            .chat-message {
                color: #fff !important;
            }
        }

        .chat-avatar {
            position: relative;
            margin-right: 12px;

            img {
                width: 40px;
            }

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
            min-width: 100px;

            .chat-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 4px;

                .chat-name {
                    font-weight: 500;
                    font-size: 14px;
                    color: #333;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }

                .chat-time {
                    font-size: 12px;
                    color: #999;
                }
            }

            .chat-message {
                font-size: 13px;
                width: 150px;
                color: #666;
                padding-top: 5px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }

        .chat-badge {
            min-width: 18px;
            height: 18px;
            padding: 0 6px;
            background-color: #ff4d4f;
            border-radius: 9px;
            color: white;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: 8px;
        }
    }

    .empty-list {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }






    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
        width: 6px;
    }





    &::-webkit-scrollbar-thumb {
        background-color: #dcdfe6;
        border-radius: 3px;
    }



    &::-webkit-scrollbar-track {
        background-color: transparent;
    }
}
</style>