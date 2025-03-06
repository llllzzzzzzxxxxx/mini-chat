import Http from '@/utils/axios'

export const send = (param: any) => Http.post('/api/v1/message/send', param);

export const record = (param: any) => Http.post('/api/v1/message/record', param);

export const recall = (param: any) => Http.post('/api/v1/message/recall', param);


