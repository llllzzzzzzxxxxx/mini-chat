import { defineStore } from 'pinia'
import type { ChatListItem } from '@/types/chatList'
import { group, privateList,create } from '@/api/chatList'
import { ElMessage } from 'element-plus'
import { useMessageStore } from './useMessageStore'
import { read } from '@/api/chatList'

export const useChatListStore = defineStore('chatList', {
    state: () => ({
        chatList: [] as ChatListItem[],
    }),
    actions: {
        async fetchAllChats() {
            try {
                // 获取群聊列表
                const groupRes = await group()
                // 获取私聊列表
                const privateRes = await privateList()

                if (groupRes.code === 0 && privateRes.code === 0) {
                    const groupChats = Array.isArray(groupRes.data) ? groupRes.data : [groupRes.data]
                    const privateChats = Array.isArray(privateRes.data) ? privateRes.data : [privateRes.data]
                    // console.log('privateChats',privateChats)

                    // 合并两个列表
                    this.chatList = [...groupChats, ...privateChats]

                    // 如果有群聊，自动设置第一个群聊的targetId
                    const messageStore = useMessageStore()
                    if (groupChats.length > 0&&messageStore.targetId==='') {
                        messageStore.setChatName(groupChats[0].targetInfo.name)
                        messageStore.setTargetId(groupChats[0].targetId)
                        messageStore.source = groupChats[0].type
                        await read({targetId:groupChats[0].targetId})
                    }
                } else {
                    ElMessage.error('获取聊天列表失败')
                }
            } catch (error: any) {
                ElMessage.error(error.message || '获取聊天列表失败')
            }
        },
        async readChat(targetId: string) {
            await read({targetId:targetId})
            this.chatList.forEach(chat => {
                if (chat.targetId === targetId) {
                    chat.unreadCount = 0
                }
            })
        },
        async createChat(targetId: string,name:string) {
            const res = await create({"targetId":targetId})
            if (res.code === 0) {
                const messageStore = useMessageStore()
                messageStore.setTargetId(targetId)
                messageStore.setChatName(name)
                this.fetchAllChats()
            }
            this.readChat(targetId)
        }
    },
    getters: {
        groupChats: (state) => state.chatList
            .filter(chat => chat.type === 'group')
            .sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()),
        privateChats: (state) => state.chatList
            .filter(chat => chat.type === 'user')
            .sort((a, b) => new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()),
        
    }
    
})
