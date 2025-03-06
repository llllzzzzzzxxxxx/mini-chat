import Http from '@/utils/axios'

export const list = () => Http.get('/api/v1/user/list');

export const listMap = () => Http.get('/api/v1/user/list/map');

export const onlineWeb = () => Http.get('/api/v1/user/online/web');

export const update = (param: any) => Http.post('/api/v1/user/update', param);
