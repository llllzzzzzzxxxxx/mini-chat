<template>
    <div>
        <div class="group-list">
            <div class="group-list-item" v-for="(item, index) in userStore.userMap" :key="index"
                @click="handleGroupClick(item)">
                <div class="group-list-item-avatar">
                    <img v-if="item.avatar" :src="item.avatar" alt="">
                    <Avatar v-else :name="item.name" :size="30" />
                </div>
                <div class="group-list-item-name">
                    {{ item.name }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { listMap } from '@/api/user'
import type { UserMapResponse, UserMapItem } from '@/types/user'
import { useUserStore } from '@/stores/module/useUserStore'
import { useMessageStore } from '@/stores/module/useMessageStore'
import { useChatListStore } from '@/stores/module/usechatListStore'
import Avatar from '@/components/Avatar.vue'
import { ElMessage } from 'element-plus'
const userStore = useUserStore()
const messageStore = useMessageStore()
const chatListStore = useChatListStore()
onMounted(() => {
    userStore.getUserMap()
})
const handleGroupClick = (item: UserMapItem) => {
    try {
        chatListStore.createChat(item.id,item.name)
    } catch (error: any) {
        ElMessage.error(error.message || '创建聊天失败')
        return
    }
    messageStore.setTargetId(item.id)
    messageStore.setChatName(item.name)
    chatListStore.fetchAllChats()

}
</script>

<style scoped lang="scss">
.group-list {

    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 10px;

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
        justify-content: flex-start;
        gap: 10px;

        &:hover {
            background-color: #fff;
            cursor: pointer;
        }

        img {
            width: 30px;
        }
    }
}
</style>