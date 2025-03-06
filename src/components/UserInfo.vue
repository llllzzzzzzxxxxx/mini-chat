<template>
    <el-dialog v-model="dialogVisible" title="编辑用户信息" width="400px" center>
        <div class="user-info-container">
            <div class="avatar-container">
                <el-avatar :size="100" :src="userInfo.avatar || defaultAvatar">
                    <img :src="defaultAvatar" />
                </el-avatar>
                <el-upload class="avatar-uploader" action="/api/v1/user/upload" :show-file-list="false"
                    :on-success="handleAvatarSuccess" :before-upload="beforeAvatarUpload" :headers="uploadHeaders">
                    <el-button type="primary" size="small">更换头像</el-button>
                </el-upload>
            </div>
            <div class="info-form">
                <el-form :model="userInfo" label-width="80px">
                    <el-form-item label="用户名">
                        <el-input v-model="userInfo.userName" placeholder="请输入用户名" />
                    </el-form-item>
                    <el-form-item label="邮箱">
                        <el-input v-model="userInfo.email" disabled />
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
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/module/useUserStore'
import { update } from '@/api/user'
import type { UserInfo } from '@/types/login'

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
            userName: userInfo.value.userName,
            avatar: userInfo.value.avatar
        })

        if (res.code === 0) {
            // 更新store中的用户信息
            userStore.setUser(userInfo.value)
            ElMessage.success('保存成功')
            dialogVisible.value = false
        } else {
            ElMessage.error(res.msg || '保存失败')
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
        }
    }

    .info-form {
        .el-form-item {
            margin-bottom: 20px;
        }
    }
}

.dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
</style>