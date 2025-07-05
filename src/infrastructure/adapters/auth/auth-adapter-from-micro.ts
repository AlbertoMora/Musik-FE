import {
    IAuthGateway,
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
            const res = await fetch(`${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });
            return await this.getResponseData<ISessionResponseDTO>(res);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    public async signIn(userInfo: ISignInModel) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/auth/login`
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
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/auth/login-challenge`
            ).post(user);
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
