<template>
    <div class="message-container">
        <div class="message-list" ref="messageList">
            <div v-for="(message, index) in messageStore.messages" :key="message.id" class="message-item">
                <!-- 时间显示 -->
                <div v-if="message.isShowTime" class="message-time">
                    {{ formatTime(message.createTime) }}
                </div>
                <!-- 消息内容 -->
                <div class="message-content" :class="{ 'message-self': isSelf(message.fromId) }">
                    <div class="message-avatar">
                        <Avatar :name="message.fromInfo.name" :size="40" />
                    </div>
                    <div class="message-body">
                        <div class="message-name">{{ message.fromInfo.name }}</div>
                        <div class="message-text" v-if="message.type === 'text'">
                            <template v-if="Array.isArray(message.message)">
                                <template v-for="(item, idx) in message.message" :key="idx">
                                    <span v-if="item.type === 'text'">{{ item.content }}</span>
                                    <span v-else-if="item.type === 'at'" class="at-user">
                                        @{{ JSON.parse(item.content).name }}
                                    </span>
                                </template>
                            </template>
                            <span v-else>{{ message.message as string }}</span>
                        </div>
                        <div class="message-emoji" v-else-if="message.type === 'emoji'">
                            <img :src="message.message as string" alt="emoji" class="emoji-img" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { record } from '@/api/message'
import type { RecordParams } from '@/types/message'
import { ElMessage } from 'element-plus'
import { formatTime } from '@/utils/date'
import Avatar from '@/components/Avatar.vue'
import { useUserStore } from '@/stores/module/useUserStore'
import { useMessageStore } from '@/stores/module/useMessageStore'

const messageList = ref<HTMLElement | null>(null)
const userStore = useUserStore()
const messageStore = useMessageStore()

// 判断是否是自己发送的消息
const isSelf = (fromId: string) => {
    return fromId === userStore.user?.userId.toString()
}

// 滚动到底部
const scrollToBottom = async () => {
    await nextTick()
    if (messageList.value) {
        messageList.value.scrollTop = messageList.value.scrollHeight
    }
}

// 获取消息记录
const fetchMessages = async () => {
    if (!messageStore.targetId) return

    try {
        messageStore.loading = true
        const params: RecordParams = {
            index: 0,
            num: 10,
            targetId: messageStore.targetId
        }
        const res = await record(params)
        if (res.code === 0) {
            messageStore.setMessages(res.data)
            await scrollToBottom()
        } else {
            ElMessage.error(res.msg || '获取消息记录失败')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '获取消息记录失败')
    } finally {
        messageStore.loading = false
    }
}

// 监听targetId变化
watch(() => messageStore.targetId, (newId) => {
    if(messageStore.targetId==='')messageStore.clearMessages()
    if (newId) {
        fetchMessages()
    }
})

onMounted(() => {
    if (messageStore.targetId) {
        fetchMessages()
    }
})
</script>

<style scoped lang="scss">
.message-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
    padding: 20px;
    box-sizing: border-box;
}

.message-list {
    flex: 1;
    overflow-y: auto;
    padding: 0 20px;

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

.message-item {
    margin-bottom: 20px;
}

.message-time {
    text-align: center;
    margin: 20px 0;
    color: #999;
    font-size: 12px;
}

.message-content {
    display: flex;
    margin-bottom: 20px;
    align-items: flex-start;

    &.message-self {
        flex-direction: row-reverse;

        .message-body {
            margin-right: 12px;
            margin-left: 0;
            align-items: flex-end;

            .message-name {
                text-align: right;
            }

            .message-text {
                background-color: #95ec69;
                border-radius: 0 4px 4px 4px;
            }
        }
    }
}

.message-avatar {
    margin-right: 12px;
}

.message-body {
    max-width: 60%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.message-name {
    font-size: 12px;
    color: #999;
    margin-bottom: 4px;
}

.message-text {
    background-color: #fff;
    padding: 10px 15px;
    border-radius: 4px 0 4px 4px;
    font-size: 14px;
    line-height: 1.5;
    word-break: break-all;

    .at-user {
        color: #1890ff;
        cursor: pointer;
    }
}

.message-emoji {
    .emoji-img {
        max-width: 200px;
        max-height: 200px;
        border-radius: 4px;
    }
}
</style>