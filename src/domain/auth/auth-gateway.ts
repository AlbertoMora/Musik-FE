export interface IAuthGateway {
    signUp: (user: ISignUpModel) => Promise<ISessionResponseDTO | null>;
    signIn: (userInfo: ISignInModel) => Promise<ISignInDigitalSignDTO | ISessionResponseDTO | null>;
    signInChallenge?: (challengeInfo: ISignInChallengeModel) => Promise<ISessionResponseDTO | null>;
    checkMfa: (
        mfaInfo: ICheckMfaModel
    ) => Promise<ISessionResponseDTO | IGenericMfaResponse | null>;
    checkSession?: (accessToken: string) => Promise<boolean>;
    refreshSession?: (refreshToken: string) => Promise<ISessionResponseDTO | null>;
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
