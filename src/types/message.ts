// 用户信息
export interface UserInfo {
    id: string
    name: string
    avatar: string | null
    type: string
    badge: string[] | null
}

// 消息内容项
export interface MessageContent {
    type: 'text' | 'at' | 'emoji' | 'image' | 'file'
    content: string
}

// 消息记录
export interface MessageRecord {
    id: string
    fromId: string
    toId: string
    fromInfo: UserInfo
    message: string | MessageContent[]
    referenceMsg: any | null
    atUser: any | null
    isShowTime: boolean
    type: string
    source: string
    createTime: string
    updateTime: string
}

// 获取消息记录参数
export interface RecordParams {
    index: number
    num: number
    targetId: string
}

// API响应
export interface MessageResponse {
    code: number
    msg: string
    data: MessageRecord[]
}
