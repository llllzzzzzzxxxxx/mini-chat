<template>
    <el-dialog v-model="dialogVisible" title="编辑用户信息" width="400px" center>
        <div class="user-info-container">
            <div class="avatar-container">
                <el-avatar :size="100" :src="userInfo.avatar || defaultAvatar">
                    <img :src="defaultAvatar" />
                </el-avatar>
                <el-upload class="avatar-uploader" action="/api/v1/user/upload" :show-file-list="false"
                    :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" :headers="uploadHeaders"
                    :http-request="handleCustomRequest">
                    <div 
                        class="drag-area"
                    >
                        <div class="upload-tip">
                            点击上传
                        </div>
                    </div>
                </el-upload>
            </div>
            <div class="info-form">
                <el-form :model="userInfo" label-width="80px">
                    <el-form-item label="用户名">
                        <el-input v-model="userInfo.userName" placeholder="请输入用户名" />
                    </el-form-item>
                </el-form>
            </div>
        </div>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSave">保存</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { upload } from '@/api/file'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/module/useUserStore'
import { update } from '@/api/user'
import type { UserInfo } from '@/types/login'
import type { ApiResponse } from '@/types/common'

const props = defineProps<{
    modelValue: boolean
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: boolean): void
}>()

const userStore = useUserStore()
const defaultAvatar = 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'

// 计算属性用于双向绑定
const dialogVisible = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

// 用户信息
const userInfo = ref<UserInfo>({
    userId: userStore.user?.userId || 0,
    userName: userStore.user?.userName || '',
    email: userStore.user?.email || '',
    avatar: userStore.user?.avatar || null,
    type: userStore.user?.type || ''
})

// 拖拽状态
// 删除拖拽状态声明
// const isDragging = ref(false)

// 删除拖拽处理方法
// const handleDragover = () => {
//     isDragging.value = true
// }
// const handleDragleave = () => {
//     isDragging.value = false
// }
// const handleDrop = (e: DragEvent) => {
//     isDragging.value = false
//     const files = e.dataTransfer?.files
//     if (files && files[0]) {
//         handleCustomRequest({ file: files[0] })
//     }
// }

// 自定义上传方法
const handleCustomRequest = async (options: any) => {
    try {
        const formData = new FormData()
        formData.append('file', options.file)
        const res = await upload(formData)
        if (res.code === 0) {
            userInfo.value.avatar = res.data
            ElMessage.success('头像上传成功')
        }
    } catch (error) {
        ElMessage.error('上传失败')
    }
}

// 上传请求头
const uploadHeaders = computed(() => ({
    'x-token': localStorage.getItem('x-token') || ''
}))

// 头像上传成功回调
const handleAvatarSuccess = (response: any) => {
    if (response.code === 0) {
        userInfo.value.avatar = response.data
        ElMessage.success('头像上传成功')
    } else {
        ElMessage.error(response.msg || '头像上传失败')
    }
}

// 上传前验证
const beforeAvatarUpload = (file: File) => {
    const isJPG = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif'
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isJPG) {
        ElMessage.error('上传头像图片只能是 JPG/PNG/GIF 格式!')
    }
    if (!isLt2M) {
        ElMessage.error('上传头像图片大小不能超过 2MB!')
    }
    return isJPG && isLt2M
}

// 保存用户信息
const handleSave = async () => {
    if (!userInfo.value.userName) {
        ElMessage.error('请输入用户名')
        return
    }
    try {
        const res = await update({
            name: userInfo.value.userName,
            avatar: userInfo.value.avatar
        })

        if ((res as ApiResponse).code === 0) {
            // 更新store中的用户信息
            userStore.setUser(userInfo.value)
            ElMessage.success('保存成功')
            dialogVisible.value = false
        } else {
            ElMessage.error((res as ApiResponse).msg || '保存失败')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '保存失败，请稍后重试')
    }
}
</script>

<style scoped lang="scss">
.user-info-container {
    padding: 20px;

    .avatar-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 20px;

        .avatar-uploader {
            margin-top: 10px;
            width: 100px;
            height: 100px;
            .drag-area {
                width: 100%;
                height: 100%;
                border: 2px dashed var(--el-color-primary);
                border-radius: 6px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(64, 158, 255, 0.1);
                cursor: pointer;
                // 移除hover状态样式
                // &:hover {
                //     border-color: var(--el-color-primary-light-3);
                // }
                .upload-tip {
                    text-align: center;
                    font-size: 12px;
                    color: var(--el-text-color-regular);
                    padding: 8px;
                }
            }
        }
    }

    .info-form {
        .el-form-item {
            margin-bottom: 20px;
        }
    }
}

.dialog-footer {
    color: black;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>