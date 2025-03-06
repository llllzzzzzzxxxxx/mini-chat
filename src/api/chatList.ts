import Http from '@/utils/axios'
export const group = () => Http.get('/api/v1/chat-list/group');

export const privateList = () => Http.get('/api/v1/chat-list/list/private');

export const create = (param: any) => Http.post('/api/v1/chat-list/create', param);

export const read = (param: any) => Http.post('/api/v1/chat-list/read', param);

export const deleteList = (param: any) => Http.post('/api/v1/chat-list/delete', param); 