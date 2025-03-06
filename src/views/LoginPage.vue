<template>
    <div class="login-page">
        <div class="shell">
            <div class="container a-container" :class="{ 'is-txl': !isLogin }">
                <form class="form" id="a-form">
                    <h2 class="form_title title">创建账号</h2>
                    <input type="text" class="form_input" v-model="registerForm.userName" placeholder="Name">
                    <input type="text" class="form_input" v-model="registerForm.email" placeholder="Email">
                    <div class="verify-code">
                        <input type="text" class="form_input" v-model="registerForm.emailCode" placeholder="验证码">
                        <button type="button" class="form_button button send-code-btn" :disabled="countdown > 0"
                            @click="sendVerifyCode">
                            {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
                        </button>
                    </div>
                    <input type="password" class="form_input" v-model="registerForm.password" placeholder="Password">
                    <input type="password" class="form_input" v-model="registerForm.confirmPassword"
                        placeholder="Confirm Password">
                    <button class="form_button button submit">SIGN UP</button>
                </form>
            </div>

            <div class="container b-container" :class="{ 'is-txl': isLogin, 'is-z': isLogin }">
                <form class="form" id="b-form">
                    <h2 class="form_title title">登入账号</h2>
                    <input type="text" class="form_input" v-model="loginForm.userName" placeholder="Username">
                    <input type="text" class="form_input" v-model="loginForm.password" placeholder="Password">
                    <a class="form_link">忘记密码？</a>
                    <button class="form_button button submit">SIGN IN</button>
                </form>
            </div>

            <div class="switch" :class="{ 'is-txr': isLogin, 'is-gx': isAnimating }" id="switch-cnt">
                <div class="switch_circle" :class="{ 'is-txr': isLogin }"></div>
                <div class="switch_circle switch_circle-t" :class="{ 'is-txr': isLogin }"></div>
                <div class="switch_container" :class="{ 'is-hidden': isLogin }" id="switch-c1">
                    <h2 class="switch_title title" style="letter-spacing: 0;">Welcome Back！</h2>
                    <p class="switch_description description">已经有账号了嘛，去登入账号来进入奇妙世界吧！！！</p>
                    <button class="switch_button button switch-btn">SIGN IN</button>
                </div>

                <div class="switch_container" :class="{ 'is-hidden': !isLogin }" id="switch-c2">
                    <h2 class="switch_title title" style="letter-spacing: 0;">Hello Friend！</h2>
                    <p class="switch_description description">去注册一个账号，成为尊贵的粉丝会员，让我们踏入奇妙的旅途！</p>
                    <button class="switch_button button switch-btn">SIGN UP</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { login, register, getCode } from '@/api/login'
import { ElMessage } from 'element-plus'
import type { LoginResponse, RegisterResponese, CodeResponese, UserInfo } from '@/types/login'
import { useUserStore } from '@/stores/module/useUserStore'

const router = useRouter()
const isLogin = ref(true)
const isAnimating = ref(false)
const countdown = ref(0)

// 表单数据
const loginForm = ref({
    userName: '',
    password: ''
})

const registerForm = ref({
    userName: '',
    email: '',
    emailCode: '',
    password: '',
    confirmPassword: ''
})

// 切换登录/注册
const handleSwitch = () => {
    isAnimating.value = true
    setTimeout(() => {
        isAnimating.value = false
    }, 1500)
    isLogin.value = !isLogin.value
}

// 处理登录
const handleLogin = async () => {
    if (!loginForm.value.userName || !loginForm.value.password) {
        ElMessage.error('请输入用户名和密码')
        return
    }

    try {
        const res = await login(loginForm.value) as LoginResponse
        if (res.code === 0) {
            // 存储token
            localStorage.setItem('x-token', res.data.token)
            useUserStore().setUser(res.data as UserInfo)
            localStorage.setItem('user', JSON.stringify(res.data))
            ElMessage.success('登录成功')
            router.push('/')
        } else {
            ElMessage.error(res.msg || '登录失败')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '登录失败，请稍后重试')
    }
}

// 处理注册
const handleRegister = async () => {
    // 表单验证
    if (!registerForm.value.userName || !registerForm.value.email ||
        !registerForm.value.password || !registerForm.value.confirmPassword ||
        !registerForm.value.emailCode) {
        ElMessage.error('请填写所有必填项')
        return
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(registerForm.value.email)) {
        ElMessage.error('请输入正确的邮箱格式')
        return
    }

    // 验证密码
    if (registerForm.value.password !== registerForm.value.confirmPassword) {
        ElMessage.error('两次输入的密码不一致')
        return
    }

    try {
        const res = await register({
            userName: registerForm.value.userName,
            email: registerForm.value.email,
            password: registerForm.value.password,
            emailCode: registerForm.value.emailCode
        }) as RegisterResponese

        if (res.code === 0) {
            ElMessage.success('注册成功')
            // 清空表单
            registerForm.value = {
                userName: '',
                email: '',
                emailCode: '',
                password: '',
                confirmPassword: ''
            }
            // 切换到登录页面
            isLogin.value = true
        } else {
            ElMessage.error(res.msg || '注册失败')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '注册失败，请稍后重试')
    }
}

// 发送验证码
const sendVerifyCode = async () => {
    if (!registerForm.value.email) {
        ElMessage.error('请输入邮箱')
        return
    }
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(registerForm.value.email)) {
        ElMessage.error('请输入正确的邮箱格式')
        return
    }

    try {
        const res = await getCode({ email: registerForm.value.email }) as CodeResponese
        if (res.code === 0) {
            ElMessage.success('验证码已发送')
            // 开始倒计时
            countdown.value = 60
            const timer = setInterval(() => {
                countdown.value--
                if (countdown.value <= 0) {
                    clearInterval(timer)
                }
            }, 1000)
        } else {
            ElMessage.error(res.msg || '发送验证码失败')
        }
    } catch (error: any) {
        ElMessage.error(error.message || '发送验证码失败，请重试')
    }
}

onMounted(() => {
    // 添加按钮点击事件
    const allButtons = document.querySelectorAll('.submit')
    allButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault()
            if (isLogin.value) {
                handleLogin()
            } else {
                handleRegister()
            }
        })
    })

    const switchBtn = document.querySelectorAll('.switch-btn')
    switchBtn.forEach(button => {
        button.addEventListener('click', handleSwitch)
    })
})
</script>

<style scoped lang="scss">
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    user-select: none;
}

.login-page {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    // background-image: linear-gradient(90deg, #e0c3fc, #8ec5fc 100%);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
}

body {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    background-color: #ecf0f3;
    color: #a0a5a8;
}

.shell {
    // position: relative;
    width: 1000px;
    min-width: 1000px;
    min-height: 600px;
    height: 600px;
    padding: 25px;
    background-color: #ecf0f3;
    box-shadow: 10px 10px 10px #d1d9e6, -10px -10px 10px #f9f9f9;
    border-radius: 12px;
    overflow: hidden;
    margin: 0 auto;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
}

@media (max-width: 1200px) {
    .shell {
        transform: scale(0.7);
    }
}

@media (max-width: 1000px) {
    .shell {
        transform: scale(0.6);
    }
}

@media (max-width: 800px) {
    .shell {
        transform: scale(0.5);
    }
}

@media (max-width: 600px) {
    .shell {
        transform: scale(0.4);
    }
}

.container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    width: 600px;
    height: 100%;
    padding: 25px;
    background-color: #ecf0f3;
    transition: 1.25s;
}

.form {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    width: 100%;
    height: 100%;
    padding: 20px 0;
}

.form_title {
    margin-bottom: 20px;
}

.form_span {
    margin-top: 30px;
    margin-bottom: 12px;
    color: #666666;
}

.iconfont {
    margin: 0 5px;
    border: rgba(0, 0, 0, 0.5) 2px solid;
    border-radius: 50%;
    font-size: 25px;
    padding: 3px;
    opacity: 0.5;
    transition: 0.1s;
}

.iconfont:hover {
    opacity: 1;
    transition: 0.15s;
    cursor: pointer;
}

.form_input {
    width: 350px;
    height: 40px;
    margin: 4px 0;
    padding-left: 25px;
    font-size: 13px;
    letter-spacing: 0.15px;
    border: none;
    outline: none;
    background-color: #ecf0f3;
    transition: 0.25s ease;
    border-radius: 8px;
    box-shadow: inset 2px 2px 4px #d1d9e6, inset -2px -2px 4px #f9f9f9;
    color: #666666;
}

.form_input:focus {
    box-shadow: inset 4px 4px 4px #d1d9e6, inset -4px -4px 4px #f9f9f9;
}

.form_link {
    color: #666666;
    font-size: 15px;
    margin-top: 25px;
    border-bottom: 1px solid #a0a5a8;
    line-height: 2;
}

.title {
    font-size: 34px;
    font-weight: 700;
    line-height: 3;
    color: #666666;
    letter-spacing: 10px;
}

.description {
    color: #666666;
    font-size: 14px;
    letter-spacing: 0.25px;
    text-align: center;
    line-height: 1.6;
}

.button {
    width: 180px;
    height: 50px;
    border-radius: 25px;
    margin-top: 50px;
    font-weight: 700;
    font-size: 14px;
    letter-spacing: 1.15px;
    background-color: #4B70E2;
    color: #f9f9f9;
    box-shadow: 8px 8px 16px #d1d9e6, -8px -8px 16px #f9f9f9;
    border: none;
    outline: none;
    cursor: pointer;
}

.a-container {
    z-index: 100;
    margin-left: 400px;
    right: 0;
    left: auto;
}

.b-container {
    left: 0;
    z-index: 0;
}

.switch {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 400px;
    padding: 50px;
    z-index: 200;
    transition: 1.25s;
    background-color: #ecf0f3;
    overflow: hidden;
    box-shadow: 4px 4px 10px #d1d9e6, -4px -4px 10px #d1d9e6;
}

.switch_circle {
    position: absolute;
    width: 500px;
    height: 500px;
    border-radius: 50%;
    background-color: #ecf0f3;
    box-shadow: inset 8px 8px 12px #b8bec7, inset -8px -8px 12px #fff;
    bottom: -60%;
    left: -60%;
    transition: 1.25s;
}

.switch_circle-t {
    top: -30%;
    left: 60%;
    width: 300px;
    height: 300px;
}

.switch_container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    position: absolute;
    width: 400px;
    padding: 50px 55px;
    transition: 1.25s;
}

.switch_button {
    cursor: pointer;
}

.switch_button:hover,
.submit:hover {
    box-shadow: 6px 6px 10px #d1d9e6, -6px -6px 10px #f9f9f9;
    transform: scale(0.985);
    transition: 0.25s;
}

.switch_button:active,
.switch_button:focus {
    box-shadow: 2px 2px 6px #d1d9e6, -2px -2px 6px #f9f9f9;
    transform: scale(0.97);
    transition: 0.25s;
}

.is-txr {
    left: calc(100% - 400px);
    transition: 1.25s;
    transform-origin: left;
}

.is-txl {
    left: 0;
    transition: 1.25s;
    transform-origin: right;
}

.is-z {
    z-index: 200;
    transition: 1.25s;
}

.is-hidden {
    visibility: hidden;
    opacity: 0;
    position: absolute;
    transition: 1.25s;
}

.is-gx {
    animation: is-gx 1.25s;
}

@keyframes is-gx {

    0%,
    10%,
    100% {
        width: 400px;
    }

    30%,
    50% {
        width: 500px;
    }
}

.verify-code {
    display: flex;
    gap: 10px;
    width: 350px;
    margin: 4px 0;
}

.verify-code .form_input {
    flex: 1;
    margin: 0;
}

.send-code-btn {
    width: 120px;
    height: 40px;
    margin: 0;
    font-size: 12px;
    padding: 0;
}

.send-code-btn:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}
</style>