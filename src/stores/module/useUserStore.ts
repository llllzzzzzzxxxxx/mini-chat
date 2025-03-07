import { defineStore } from 'pinia'
import type { UserInfo } from '@/types/login'
import { logout } from '@/api/login'
import { group } from '@/api/chatList'
import ws from '@/utils/ws'

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null as UserInfo | null,
        token: '',
        chatList: [] as any[],
    }),
    actions: {
        setUser(user: UserInfo) {
            this.user = user
        },
        setToken(token: string) {
            this.token = token
        },
        async logout() {
            this.user = null
            this.token = ''
            ws.disConnect()
            localStorage.removeItem('user')
            localStorage.removeItem('x-token')
        },
        clearUser() {
            this.user = null
            this.token = ''
        }
    }
})