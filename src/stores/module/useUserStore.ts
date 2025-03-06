import { defineStore } from 'pinia'
import type { UserInfo } from '@/types/login'
import { logout } from '@/api/login'
import { group } from '@/api/chatList'

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null as UserInfo | null,
        token: '',
        
    }),
    actions: {
        setUser(user: UserInfo) {
            this.user = user
        },
        setToken(token: string) {
            this.token = token
        },
        logout() {
            this.user = null
            this.token = ''
            localStorage.removeItem('user')
            localStorage.removeItem('x-token')
        },
        clearUser() {
            this.user = null
            this.token = ''
        }
    }
})