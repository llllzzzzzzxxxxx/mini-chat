import EventBus from '@/utils/eventBus.ts'

interface WSMessage {
  type: 'msg' | 'notify' | 'video' | 'file';
  data?: {
    code: number;
  };
  content?: {
    content?: string;
    [key: string]: any;
  };
}

let ws: WebSocket | null = null
let heartTimer: number | null = null
let timer: number | null = null
let lockReconnect = false
let token: string | null = null
const reconnectCountMax = 200
let reconnectCount = 0
let isConnect = false

function response(event: MessageEvent) {
  if (event.type !== 'message') {
    onCloseHandler()
    return
  }
  let wsContent: WSMessage
  try {
    wsContent = JSON.parse(event.data)
  } catch {
    onCloseHandler()
    return
  }
  if (wsContent.type) {
    if (wsContent.data && wsContent.data.code === -1) {
      onCloseHandler()
    } else {
      switch (wsContent.type) {
        case 'msg': {
          if (wsContent.content) {
            EventBus.emit('on-receive-msg', wsContent.content)
          }
          break
        }
        case 'notify': {
          if (wsContent.content?.content) {
            try {
              wsContent.content.content = JSON.parse(wsContent.content.content)
              EventBus.emit('on-receive-notify', wsContent.content)
            } catch (e) {
              console.error('Failed to parse notify content:', e)
            }
          }
          break
        }
        case 'video': {
          if (wsContent.content) {
            EventBus.emit('on-receive-video', wsContent.content)
          }
          break
        }
        case 'file': {
          if (wsContent.content) {
            EventBus.emit('on-receive-file', wsContent.content)
          }
          break
        }
      }
    }
  } else {
    onCloseHandler()
  }
}

function connect(tokenStr: string) {
  if (isConnect || ws) return
  isConnect = true
  token = tokenStr
  try {
    const wsIp = import.meta.env.VITE_WS_URL
    ws = new WebSocket(wsIp + '/ws?x-token=' + token)
    ws.onopen = () => {
      console.log('Connected to server')
      clearTimer()
      sendHeartPack()
    }

    ws.onmessage = response
    ws.onclose = onCloseHandler
    ws.onerror = onCloseHandler
  } catch {
    onCloseHandler()
  }
}

function send(msg: string) {
  if (ws && ws.readyState === WebSocket.OPEN) ws.send(msg)
}

const sendHeartPack = () => {
  heartTimer = setInterval(() => {
    send('heart')
  }, 9900)
}

const onCloseHandler = () => {
  clearHeartPackTimer()
  if (ws) {
    ws.close()
    ws = null
  }
  isConnect = false
  if (lockReconnect) return
  lockReconnect = true
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  if (reconnectCount >= reconnectCountMax) {
    reconnectCount = 0
    return
  }
  if (token) {
    timer = setTimeout(() => {
      connect(token!)
      reconnectCount++
      lockReconnect = false
    }, 5000)
  }
}

const clearHeartPackTimer = () => {
  console.log('Closing connection')
  if (heartTimer) {
    clearInterval(heartTimer)
    heartTimer = null
  }
}

const clearTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const disConnect = () => {
  clearHeartPackTimer()
  token = null
  if (ws) {
    ws.close()
    ws = null
  }
  isConnect = false
}

export default { connect, disConnect }