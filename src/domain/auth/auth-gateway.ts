export interface IAuthGateway {
    signUp: (user: ISignUpModel) => Promise<IActionResponse<ISessionResponseDTO>>;
    signIn: (
        userInfo: ISignInModel
    ) => Promise<IActionResponse<ISignInDigitalSignDTO | ISessionResponseDTO>>;
    signInChallenge?: (
        challengeInfo: ISignInChallengeModel
    ) => Promise<IActionResponse<ISessionResponseDTO>>;
    checkMfa: (
        mfaInfo: ICheckMfaModel
    ) => Promise<IActionResponse<ISessionResponseDTO & IGenericMfaResponse>>;
    checkSession?: (accessToken: string) => Promise<IActionResponse<unknown>>;
    refreshSession?: (refreshToken: string) => Promise<IActionResponse<ISessionResponseDTO>>;
}

export interface ISignUpModel {
    name?: string;
    lastname?: string;
    username: string;
    email: string;
    password: string;
    profile_pic?: string;
}

export interface ISignInModel {
    username: string;
    password: string;
}

export interface ICheckMfaModel {
    code: string;
    signature: string;
    sessionId: string;
    shouldDeviceSafe: boolean;
}

export interface ISignInChallengeModel {
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
