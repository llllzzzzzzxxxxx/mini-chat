import Http from '@/utils/axios'

export const offer = (param: any) => Http.post('/api/v1/file/offer', param);

export const answer = (param: any) => Http.post('/api/v1/file/answer', param);

export const candidate = (param: any) => Http.post('/api/v1/file/candidate', param);

export const cancel = (param: any) => Http.post('/api/v1/file/cancel', param);

export const invite = (param: any) => Http.post('/api/v1/file/invite', param);

export const accept = (param: any) => Http.post('/api/v1/file/accept', param);

export const upload = (param: any) => Http.post('/api/v1/common/upload', param);
