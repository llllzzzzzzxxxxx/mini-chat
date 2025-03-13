<template>
    <div v-if="isVideoChat" class="draggable" ref="draggableRef" @mousedown="onMouseDown" @touchstart="onTouchStart"
        :style="{ left: position.x + 'px', top: position.y + 'px' }">
        <div class="video-chat">

        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
const props = defineProps({
    isVideoChat: {
        type: Boolean,
        required: true,
        default: false
    }
})
const draggableRef = ref<HTMLDivElement | null>(null);
const position = reactive({ x: 0, y: 0 });
let offsetX = 0;
let offsetY = 0;
let isDragging = false;

const onMouseDown = (e: MouseEvent) => {
    startDragging(e.clientX, e.clientY);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
};

const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    startDragging(touch.clientX, touch.clientY);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);
};

const startDragging = (clientX: number, clientY: number) => {
    isDragging = true;
    const rect = draggableRef.value!.getBoundingClientRect();
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
};

const onMouseMove = (e: MouseEvent) => {
    if (isDragging) {
        updatePosition(e.clientX, e.clientY);
    }
};

const onTouchMove = (e: TouchEvent) => {
    if (isDragging) {
        const touch = e.touches[0];
        updatePosition(touch.clientX, touch.clientY);
    }
};

const updatePosition = (clientX: number, clientY: number) => {
    position.x = clientX - offsetX;
    position.y = clientY - offsetY;
};

const onMouseUp = () => {
    stopDragging();
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
};

const onTouchEnd = () => {
    stopDragging();
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
};

const stopDragging = () => {
    isDragging = false;
};

onMounted(() => {
    if (draggableRef.value) {
        draggableRef.value.style.position = 'absolute';
    }
    
});

onBeforeUnmount(() => {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
});
</script>

<style scoped lang="scss">
.draggable {
    cursor: move;
}
</style>