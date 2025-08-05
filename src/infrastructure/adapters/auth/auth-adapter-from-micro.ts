import {
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
import { webRequest } from '@/utils/web-utils';
export class AuthAdapterFromMicro implements IAuthGateway {
    public static readonly AUTH_MICRO_URI = process.env.AUTH_MICRO_URI;
    public async signUp(user: ISignUpModel) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/signup`
            ).post(user);
            return await this.getResponseData<ISessionResponseDTO>(res);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    public async signIn(userInfo: ISignInModel) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/login`
            ).post(userInfo);
            return await this.getResponseData<ISignInDigitalSignDTO>(res);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    public async signInChallenge(user: ISignInChallengeModel) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/login-challenge`
            ).post(user);
            return await this.getResponseData<ISessionResponseDTO>(res);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    public async checkMfa(checkMfaInfo: ICheckMfaModel) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/check-mfa`
            ).post(checkMfaInfo);
            const data = (await res.json()) as ISessionResponseDTO & IGenericMfaResponse;
            if (data.status !== responseCodes.ok && (!data.attempts || data.attempts < 3))
                return null;
            return data;
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    public async checkSession(accessToken: string) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/check-session-token`
            ).post({}, { authorization: `Bearer ${accessToken}` });
            const data = await this.getResponseData(res);

            if (!data || data?.status !== responseCodes.ok) return false;

            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    public async refreshSession(refreshToken: string) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/authentication/refresh-session`
            ).post({}, { authorization: `Bearer ${refreshToken}` });
            return await this.getResponseData<ISessionResponseDTO>(res);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    async getResponseData<T extends IBasicWebResponse>(res: Response) {
        if (!res.ok) return null;
        const data = (await res.json()) as T;
        if (data.status !== responseCodes.ok) return null;
        return data;
    }
}

export interface ISignInFromMicroModel extends ISignInModel {
    rsaPubKey: string;
    rsaPrivKey: string;
}
