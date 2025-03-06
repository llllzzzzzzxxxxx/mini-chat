import Http from '@/utils/axios';
import type{ LoginResponse, CodeResponese, RegisterResponese } from '@/types/login';
export const login = (data: any) => Http.post<LoginResponse>('/api/v1/user/login', data);

export const register = (data: any) => Http.post<RegisterResponese>('/api/v1/user/register', data);

export const getCode = (data: any) => Http.get<CodeResponese>('/api/v1/common/get-code', data);

export const logout = () => Http.post('/api/v1/user/logout');
