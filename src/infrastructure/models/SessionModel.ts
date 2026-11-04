export interface ISessionDataModel {
    user: {
        id: string;
        username: string;
        prof_pic?: string;
        isactive: number;
        ban_case_id?: string;
        rol_id: string;
        isAdmin?: boolean | number;
        isDeveloper?: boolean | number;
    };
    sessionId: string;
    exp: number;
}

export interface IRefreshTokenDataModel {
    userId: string;
    sessionId: string;
    exp: number;
    deviceId: string;
}
