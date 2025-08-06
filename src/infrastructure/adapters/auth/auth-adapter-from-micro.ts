import {
    IActionResponse,
    IAuthGateway,
    ICheckMfaModel,
    IGenericMfaResponse,
    ISessionResponseDTO,
    ISignInChallengeModel,
    ISignInDigitalSignDTO,
    ISignInModel,
    ISignUpModel,
} from '@/domain/auth/auth-gateway';
import { IBasicWebResponse, responseCodes } from '@/types/web-types';
import { webErrors, webRequest } from '@/utils/web-utils';
export class AuthAdapterFromMicro implements IAuthGateway {
    public static readonly AUTH_MICRO_URI = process.env.AUTH_MICRO_URI;
    public async signUp(user: ISignUpModel) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/signup`
            ).post(user);
            return await this.getResponseData<ISessionResponseDTO>(res, webErrors.auth01.id);
        } catch (e) {
            console.log(e);
            return { success: false, reason: webErrors.srv01.id };
        }
    }

    public async signIn(userInfo: ISignInModel) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/login`
            ).post(userInfo);
            return await this.getResponseData<ISignInDigitalSignDTO>(res, webErrors.auth02.id);
        } catch (e) {
            console.log(e);
            return { success: false, reason: webErrors.srv01.id };
        }
    }

    public async signInChallenge(user: ISignInChallengeModel) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/login-challenge`
            ).post(user);
            return await this.getResponseData<ISessionResponseDTO>(res, webErrors.auth03.id);
        } catch (e) {
            console.log(e);
            return { success: false, reason: webErrors.srv01.id };
        }
    }

    public async checkMfa(checkMfaInfo: ICheckMfaModel) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/check-mfa`
            ).post(checkMfaInfo);
            const data = (await res.json()) as ISessionResponseDTO & IGenericMfaResponse;
            if (data.status !== responseCodes.ok && (!data.attempts || data.attempts < 3))
                return { success: false, data };
            return { success: true, data };
        } catch (e) {
            console.log(e);
            return { success: false, reason: webErrors.srv01.id };
        }
    }

    public async checkSession(accessToken: string) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/check-session-token`
            ).post({}, { authorization: `Bearer ${accessToken}` });
            return await this.getResponseData(res, webErrors.auth05.id);
        } catch (e) {
            console.log(e);
            return { success: false, reason: webErrors.srv01.id };
        }
    }

    public async refreshSession(refreshToken: string) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/refresh-session`
            ).post({}, { authorization: `Bearer ${refreshToken}` });
            return await this.getResponseData<ISessionResponseDTO>(res, webErrors.auth05.id);
        } catch (e) {
            console.log(e);
            return { success: false, reason: webErrors.srv01.id };
        }
    }

    async getResponseData<T extends IBasicWebResponse>(
        res: Response,
        webError: string
    ): Promise<IActionResponse<T>> {
        if (!res.ok) return { success: false, reason: webErrors.srv01.id };

        const data = (await res.json()) as T;
        if (data.status !== responseCodes.ok) return { success: false, reason: webError, data };
        return { success: true, data };
    }
}

export interface ISignInFromMicroModel extends ISignInModel {
    rsaPubKey: string;
    rsaPrivKey: string;
}
