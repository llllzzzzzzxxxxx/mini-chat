<template>
    <div class="chat-name">
        {{ chatName }}
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useMessageStore } from '@/stores/module/useMessageStore'

const messageStore = useMessageStore()

const chatName = ref('')
watch(() => messageStore.targetId, (newId: string) => {
    if (newId) {
        chatName.value = messageStore.getChatName(newId)
    }
})

</script>

<style scoped>
.chat-name {
    width: 100%;
    height: 100%;
    color: black;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
}
</style>