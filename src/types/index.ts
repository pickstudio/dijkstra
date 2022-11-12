export type Providers = 'kakao' | 'local';

export interface CreateOAuthUserDto {
    provider: Providers;
    nickname: string;
    oAuthId: string;
    email?: string;
    gender?: any;
}
