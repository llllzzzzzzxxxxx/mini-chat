export interface LoginResponse {
    code: number
    msg: string
    data: {
        userId: number
        userName: string
        email: string
        avatar: string | null
        type: string
        token: string
    }
}
export interface CodeResponese {
    code: number;
    data: string;
    msg: string;
}
export interface RegisterResponese {
    code: number;
    data: string|null;
    msg: string;
}
export interface UserInfo {
    userId: number
    userName: string
    type: string
    email: string
    avatar: string | null
}

