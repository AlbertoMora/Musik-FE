import { IBasicWebResponse } from '@/types/web-types';

export interface IAuthGateway {
    signUp: (
        user: ISignUpModel,
        userAgent?: string,
    ) => Promise<IActionResponse<ISessionResponseDTO>>;
    signIn: (
        userInfo: ISignInModel,
        userAgent: string,
        locale?: string,
    ) => Promise<IActionResponse<ISignInDigitalSignDTO | ISessionResponseDTO>>;
    signInChallenge?: (
        challengeInfo: ISignInChallengeModel,
        userAgent: string,
    ) => Promise<IActionResponse<ISessionResponseDTO>>;
    checkMfa: (
        mfaInfo: ICheckMfaModel,
        userAgent?: string,
    ) => Promise<IActionResponse<ISessionResponseDTO & IGenericMfaResponse>>;
    checkSession?: (accessToken: string, userAgent: string) => Promise<IActionResponse<unknown>>;
    refreshSession?: (
        refreshToken: string,
        userAgent: string,
    ) => Promise<IActionResponse<ISessionResponseDTO>>;
    signOut: (accessToken: string) => Promise<IActionResponse<IBasicWebResponse>>;
    getGoogleKey: () => Promise<IActionResponse<IGetGoogleKeyModel>>;
    checkGoogleSession: (
        code: string,
        userAgent?: string,
        deviceInfo?: IDeviceRegistrationPayload,
        redirectUri?: string,
    ) => Promise<IActionResponse<ISessionResponseDTO>>;
}

export interface IDeviceRegistrationPayload {
    deviceId?: string;
    rsaPubKey?: string;
    deviceName?: string;
    deviceBrand?: string;
    deviceModel?: string;
    deviceType?: string;
    clientIp?: string;
}

export interface ISignUpModel extends IDeviceRegistrationPayload {
    name?: string;
    lastname?: string;
    username: string;
    email: string;
    password: string;
    profile_pic?: string;
}

export interface IGetGoogleKeyModel extends IBasicWebResponse {
    clientId: string;
}

export interface ISignInModel {
    username: string;
    password: string;
    deviceId?: string;
    clientIp?: string;
}

export interface ICheckMfaModel {
    code: string;
    signature: string;
    sessionId: string;
    shouldDeviceSafe: boolean;
}

export interface ISignInChallengeModel extends IDeviceRegistrationPayload {
    signedNonce: string;
    sessionId: string;
    deviceId: string;
    rsaPubKey: string;
}

export interface ISignInDigitalSignDTO {
    status: string;
    nonce: string;
    sessionId: string;
}

export interface ISessionResponseDTO {
    status: string;
    shouldVerifySession: boolean;
    accessToken: string;
    refreshToken: string;
    sendTo?: string;
}

export interface IGenericMfaResponse {
    status: string;
    attempts: number;
}

export interface IActionResponse<T> {
    success: boolean;
    reason?: string;
    data?: T;
}

export interface ILocalSessionData {
    exp: number;
    sessionId: string;
    user: {
        id: string;
        name: string;
        lastname: string;
        email: string;
        username: string;
        phone?: string;
        prof_pic?: string;
        isactive: number;
        ban_case_id?: string;
        creation_date?: string;
    };
}
