<template>
    <div class="message-container">
        <div class="message-list" ref="messageList" @scroll="handleScroll">
            <div v-if="messageStore.loading" class="loading-more">
                加载更多...
            </div>
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
                            <template v-else>
                                <template v-if="typeof message.message === 'string'">
                                    <template v-if="isJsonString(message.message)">
                                        {{ parseMessageContent(message.message) }}
                                    </template>
                                    <template v-else>
                                        {{ message.message }}
                                    </template>
                                </template>
                            </template>
                        </div>
                        <div class="message-emoji" v-else-if="message.type === 'emoji'">
                            <img :src="message.message as string" alt="emoji" class="emoji-img" />
                        </div>
                        <div class="message-text" v-else-if="message.type === 'call'">
                            <div v-if="message.message !== '0'" class="call-content">
                                <span>[语音通话]</span>
                            </div>
                            <div v-else class="call-content">
                                <span>[未接通]</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <InputField />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onBeforeUnmount } from 'vue'
import { record } from '@/api/message'
import type { RecordParams, MessageRecord } from '@/types/message'
import { ElMessage } from 'element-plus'
import { formatTime } from '@/utils/date'
import Avatar from '@/components/Avatar.vue'
import { useUserStore } from '@/stores/module/useUserStore'
import { useMessageStore } from '@/stores/module/useMessageStore'
import InputField from '@/components/InputField.vue'
import EventBus from '@/utils/eventBus'
// import { CircleClose } from '@element-plus/icons-vue'

const messageList = ref<HTMLElement | null>(null)
const userStore = useUserStore()
const messageStore = useMessageStore()
const currentPage = ref(0)
const isLoadingMore = ref(false)
const hasMore = ref(true)

// 判断是否是自己发送的消息
const isSelf = (fromId: string) => {
    return fromId === userStore.user?.userId.toString()
}

// 滚动到底部
const scrollToBottom = async (smooth = true) => {
    await nextTick()
    requestAnimationFrame(() => {
        if (messageList.value) {
            const scrollHeight = messageList.value.scrollHeight
            messageList.value.scrollTop = scrollHeight

            // 双重检查确保滚动到底部
            setTimeout(() => {
                if (messageList.value) {
                    messageList.value.scrollTop = messageList.value.scrollHeight
                }
            }, 100)
        }
    })
}

// 处理滚动事件
const handleScroll = async () => {
    if (!messageList.value || isLoadingMore.value || !hasMore.value) return

    const { scrollTop } = messageList.value
    // 当滚动到顶部时加载更多消息
    if (scrollTop < 50) {
        isLoadingMore.value = true
        const oldHeight = messageList.value.scrollHeight
        await loadMoreMessages()
        // 保持滚动位置
        await nextTick()
        if (messageList.value) {
            const newHeight = messageList.value.scrollHeight
            messageList.value.scrollTop = newHeight - oldHeight
        }
        isLoadingMore.value = false
    }
}

// 加载更多消息
const loadMoreMessages = async () => {
    if (!messageStore.targetId) return
    try {
        messageStore.loading = true
        const params: RecordParams = {
            index: currentPage.value + 1,
            num: 10,
            targetId: messageStore.targetId
        }
        const res = await record(params)
        if (res.code === 0) {
            if (res.data.length === 0) {
                hasMore.value = false
                return
            }
            currentPage.value++
            // 将新消息添加到列表前面
            messageStore.prependMessages(res.data)
        } else {
            ElMessage.error(res.msg || '获取消息记录失败')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '获取消息记录失败')
    } finally {
        messageStore.loading = false
    }
}

// 获取消息记录
const fetchMessages = async () => {
    if (!messageStore.targetId) return

    try {
        messageStore.loading = true
        currentPage.value = 0
        hasMore.value = true
        const params: RecordParams = {
            index: 0,
            num: 10,
            targetId: messageStore.targetId
        }
        const res = await record(params)
        if (res.code === 0) {
            messageStore.setMessages(res.data)
            await scrollToBottom(false)
        } else {
            ElMessage.error(res.msg || '获取消息记录失败')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '获取消息记录失败')
    } finally {
        messageStore.loading = false
    }
}

// 检查字符串是否为JSON格式
const isJsonString = (str: string): boolean => {
    try {
        JSON.parse(str)
        return true
    } catch (e) {
        return false
    }
}

// 解析消息内容
const parseMessageContent = (messageStr: string): string => {
    try {
        const messageArr = JSON.parse(messageStr)
        if (Array.isArray(messageArr) && messageArr.length > 0) {
            return messageArr.map(item => item.content || '').join('')
        }
        return messageStr
    } catch (e) {
        return messageStr
    }
}

// 处理新消息
const handleNewMessage = (content: any) => {
    console.log('content', content)
    if (!messageStore.targetId) return

    // 检查消息是否属于当前聊天
    if (content.fromId === messageStore.targetId || content.toId === messageStore.targetId) {
        const newMessage: MessageRecord = {
            id: content.id,
            fromId: content.fromId,
            toId: content.toId,
            fromInfo: content.fromInfo,
            message: content.message,
            referenceMsg: content.referenceMsg,
            atUser: content.atUser,
            isShowTime: true, // 新消息总是显示时间
            type: content.type,
            source: content.source,
            createTime: content.createTime,
            updateTime: content.updateTime
        }

        // 添加消息到列表
        messageStore.appendMessage(newMessage)
        // 滚动到底部
        scrollToBottom(true)
    }
}

// 监听targetId变化
watch(() => messageStore.targetId, (newId) => {
    if (messageStore.targetId === '') messageStore.clearMessages()
    if (newId) {
        fetchMessages()
    }
})

onMounted(async () => {
    if (messageStore.targetId) {
        await fetchMessages()
    }
    // 初始化时滚动到底部
    scrollToBottom(true)

    // 监听新消息
    EventBus.on('on-receive-msg', handleNewMessage)
})

onBeforeUnmount(() => {
    // 移除事件监听
    EventBus.off('on-receive-msg', handleNewMessage)
})
</script>

<style scoped lang="scss">
.message-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;
    box-sizing: border-box;
    position: relative;
}

.message-list {
    padding: 20px;
    overflow-y: auto;
    height: calc(100vh - 300px);

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

.loading-more {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 12px;
    padding: 10px 0;

    .loading {
        margin-right: 5px;
        animation: rotating 2s linear infinite;
    }
}

@keyframes rotating {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
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