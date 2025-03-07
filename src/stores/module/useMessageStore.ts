import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MessageRecord } from '@/types/message'

export const useMessageStore = defineStore('message', {
    state: () => {
        return {
            targetId: '2',
            messages: [] as MessageRecord[],
            loading: false
        }
    }
    ,
    actions: {
        setTargetId(id: string) {
            console.log('setTargetId被调用，参数id:', id)
            this.targetId = id
            console.log('设置后的this.targetId:', this.targetId)
        },
        setMessages(list: MessageRecord[]) {
            this.messages = list
        },
        addMessage(message: MessageRecord) {
            this.messages.push(message)
        },
        clearMessages() {
            this.messages = []
            this.targetId = ''
        }
    }
})
