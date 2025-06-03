import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { MessageRecord, SendMessageParams } from '@/types/message'
import { recall, send } from '@/api/message'
export const useMessageStore = defineStore('message', () => {
    const targetId = ref('')
    const messages = ref<MessageRecord[]>([])
    const loading = ref(false)
    const chatName = ref('')
    const source = ref('')
    // 获取最新消息
    const latestMessage = computed(() => {
        if (messages.value.length === 0) return null
        return messages.value[messages.value.length - 1]
    })
    async function sendMessage(message: SendMessageParams) {
        const res = await send(message)
        if (res.code === 0) {
            messages.value.push(res.data)
        }
    }
    function setTargetId(id: string) {
        targetId.value = id
    }

    function setChatName(name: string) {
        chatName.value = name
    }

    function getChatName(id: string) {
        return chatName.value
    }

    function setMessages(list: MessageRecord[]) {
        messages.value = list.sort((a, b) =>
            new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
        )
    }

    function addMessage(message: MessageRecord) {
        messages.value.push(message)
    }

    function appendMessage(message: MessageRecord) {
        messages.value.push(message)
    }

    function prependMessages(list: MessageRecord[]) {
        const sortedList = list.sort((a, b) =>
            new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
        )
        messages.value = [...sortedList, ...messages.value]
    }

    function clearMessages() {
        messages.value = []
        targetId.value = ''
        source.value = ''
    }

    // 获取消息文本内容
    function getMessageText(message: MessageRecord): string {
        if (!message) return ''

        if (message.type === 'emoji') return '[表情]'

        if (Array.isArray(message.message)) {
            return message.message.map(item => {
                if (item.type === 'text') return item.content
                if (item.type === 'at') {
                    try {
                        return '@' + JSON.parse(item.content).name
                    } catch {
                        return '@用户'
                    }
                }
                return ''
            }).join('')
        }

        if (typeof message.message === 'string') {
            try {
                const messageArr = JSON.parse(message.message)
                if (Array.isArray(messageArr)) {
                    return messageArr.map(item => item.content || '').join('')
                }
                return message.message
            } catch {
                return message.message
            }
        }

        return ''
    }

    function removeMessage(msgId: string) {
        messages.value = messages.value.filter(msg => msg.id !== msgId)
    }

    async function recallMessage(msgId: string) {
        try {
            const res = await recall({ msgId })
            if (res.code === 0) {
                removeMessage(msgId)
                return true
            }
            return false
        } catch (error) {
            return false
        }
    }

    return {
        targetId,
        messages,
        loading,
        latestMessage,
        chatName,
        source,
        setTargetId,
        setChatName,
        getChatName,
        setMessages,
        addMessage,
        appendMessage,
        prependMessages,
        clearMessages,
        getMessageText,
        sendMessage,
        removeMessage,
        recallMessage
    }
})
