# mini-chat
一个轻量级的在线聊天室系统，支持实时消息交流，适合多场景使用。系统采用轻量级架构，具备快速响应能力，同时提供多种实用功能，如用户登录、消息记录、群组聊天等，确保良好的用户体验和高效的沟通效果
## 项目介绍
mini-chat是一款基于 Vite 5 和 Vue 3 构建的高性能即时通讯在线聊天系统。系统以轻量化设计为核心，具备快速部署和便捷扩展的特点，适用于企业内部协作、团队沟通以及小型社交平台等多种场景。 

后端仓库：[https://github.com/mingri31164/mini-chat](https://github.com/mingri31164/mini-chat)
## 相关环境
node版本：18.12.1
pnpm版本：9.9.0
## 技术栈

- Vite 5：一款现代化的前端构建工具，具有超快的热更新速度和极致的构建性能，提供了极佳的开发体验和优化后的生产构建，使前端开发更加高效便捷。

- Vue 3：一种渐进式JavaScript框架，采用响应式数据绑定和组件化开发模式，提供简洁的API和强大的功能，帮助开发者构建高性能、可维护的用户界面。

- WebSocket：一种全双工通信协议，专为实时通信应用设计，能够在客户端和服务器之间保持长连接，支持即时消息的实时推送和低延迟传输，确保系统能够快速响应用户操作。

- Pinia：一个用于构建响应式状态管理库的库，它提供了一种简单而灵活的方式来管理应用程序的状态，并支持跨组件和页面的状态共享。

- Vue-Router：一个用于构建单页应用程序的路由库，它提供了一种简单而灵活的方式来管理应用程序的导航和路由，并支持路由参数、嵌套路由等功能。

- Scss:：一种 CSS 预处理器，它允许在 CSS 中使用变量、函数、 mixins 等高级功能，并支持嵌套样式和变量继承等功能。

- Axios：一个用于在浏览器和 Node.js 中使用 XMLHttpRequest 或 XDomainRequest 发送请求的库，它提供了一种简单而灵活的方式来处理 AJAX 请求，并支持请求拦截器和响应拦截等功能。

## 项目效果
<table>
    <tr>
        <img src=".github\loginPage.png">
        <img src=".github\chatPage.png">
        <img src=".github\sendFile.png">
        <img src=".github\videoChat.png">
    </tr>
    <tr>
        <td><img src=".github\chatPageMobile.png"></td>
        <td><img src=".github\loginPageMobile.png"></td>
    </tr>
    <tr>
        <td><img src=".github\groupList.png"></td>
        <td><img src=".github\chatList.png"></td>
    </tr>
</table>

## 安装与运行
```bash
# 克隆项目
git clone https://github.com/llllzzzzzzxxxxx/mini-chat.git

# 进入项目目录
cd mini-chat

# 安装依赖
npm install

# 服务运行
npm run dev

# 服务打包
npm run build
```
