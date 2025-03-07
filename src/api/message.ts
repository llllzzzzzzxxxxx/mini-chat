import Http from '@/utils/axios'
import type { MessageResponse, RecordParams } from '@/types/message'

export const send = (param: any) => Http.post('/api/v1/message/send', param);

export const record = (param: RecordParams) => Http.post<MessageResponse>('/api/v1/message/record', param);//查询聊天记录

export const recall = (param: any) => Http.post('/api/v1/message/recall', param);//撤回消息


