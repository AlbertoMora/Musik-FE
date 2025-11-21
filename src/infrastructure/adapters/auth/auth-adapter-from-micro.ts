import {
    IActionResponse,
    IAuthGateway,
    ICheckMfaModel,
    IGenericMfaResponse,
    IGetGoogleKeyModel,
    ISessionResponseDTO,
    ISignInChallengeModel,
    ISignInDigitalSignDTO,
    ISignInModel,
    ISignUpModel,
} from '@/domain/auth/auth-gateway';
import { IBasicWebResponse, responseCodes } from '@/types/web-types';
import { webErrors, webRequest } from '@/utils/web-utils';
import { getResponseData } from '../../../utils/web-utils';
export class AuthAdapterFromMicro implements IAuthGateway {
    public static readonly AUTH_MICRO_URI = process.env.AUTH_MICRO_URI;
    public async signUp(user: ISignUpModel) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/signup`
            ).post(user);
            return await getResponseData<ISessionResponseDTO>(res, webErrors.auth01.id);
        } catch (e) {
            console.log(e);
            return { success: false, reason: webErrors.srv01.id };
        }
    }

    public async signIn(userInfo: ISignInModel, userAgent: string) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/login`
            ).post(userInfo, { 'User-Agent': userAgent });
            return await getResponseData<ISignInDigitalSignDTO>(res, webErrors.auth02.id);
        } catch (e) {
            console.log(e);
            return { success: false, reason: webErrors.srv01.id };
        }
    }

    public async signInChallenge(user: ISignInChallengeModel, userAgent: string) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/login-challenge`
            ).post(user, { 'User-Agent': userAgent });
            return await getResponseData<ISessionResponseDTO>(res, webErrors.auth03.id);
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

    public async checkSession(accessToken: string, userAgent: string) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/check-session-token`
            ).post({}, { authorization: `Bearer ${accessToken}`, 'User-Agent': userAgent });
            return await getResponseData(res, webErrors.auth05.id);
        } catch (e) {
            console.log(e);
            return { success: false, reason: webErrors.srv01.id };
        }
    }

    public async refreshSession(refreshToken: string, userAgent: string) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/refresh-session`
            ).post({}, { authorization: `Bearer ${refreshToken}`, 'User-Agent': userAgent });
            return await getResponseData<ISessionResponseDTO>(res, webErrors.auth05.id);
        } catch (e) {
            console.log(e);
            return { success: false, reason: webErrors.srv01.id };
        }
    }

    public async getGoogleKey(): Promise<IActionResponse<IGetGoogleKeyModel>> {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/oauth/google/key`
            ).get();
            return await getResponseData<IGetGoogleKeyModel>(res, webErrors.srv01.id);
        } catch (e) {
            console.log(e);
            return { success: false, reason: webErrors.srv01.id };
        }
    }

    public async checkGoogleSession(code: string) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/oauth/google/callback`
            ).post({ code });
            return await getResponseData<ISessionResponseDTO>(res, webErrors.srv01.id);
        } catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            console.log(`Error: ${err.cause ? JSON.stringify(err.cause) : err.message}`);
            return { success: false, reason: webErrors.srv01.id };
        }
    }

    public async signOut(accessToken: string) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/signout`
            ).delete(null, { authorization: `Bearer ${accessToken}` });
            return await getResponseData<IBasicWebResponse>(res, webErrors.auth05.id);
        } catch (e) {
            console.log(e);
            return { success: false, reason: webErrors.srv01.id };
        }
    }
}

export interface ISignInFromMicroModel extends ISignInModel {
    rsaPubKey: string;
    rsaPrivKey: string;
}
