'use server';

import {
    ICheckMfaModel,
    ISessionResponseDTO,
    ISignInChallengeModel,
    ISignUpModel,
} from '@/domain/auth/auth-gateway';
import { AuthAdapterFromMicro } from './auth-adapter-from-micro';
import { cookies, headers } from 'next/headers';
import { getTokenData } from '@/utils/jwt-utils';
import { IRefreshTokenDataModel } from '@/infrastructure/models/SessionModel';
import { ISignInModel } from '../../../domain/auth/auth-gateway';
import { authConstants } from '@/constants/auth-constants';
import { commonsConstants } from '@/constants/commons-constants';

export const signUpAction = async (user: ISignUpModel) => {
    const authAdapter = new AuthAdapterFromMicro();
    const res = await authAdapter.signUp(user);
    if (!res.data) return null;

    await setSessionCookie(res.data);
    return res;
};

export const signInAction = async (userInfo: ISignInModel) => {
    const authAdapter = new AuthAdapterFromMicro();
    const userAgent = (await headers()).get('user-agent') ?? commonsConstants.unknown;
    const res = await authAdapter.signIn(userInfo, userAgent);
    if (!res) return null;

    return res;
};

export const signInChallengeAction = async (challengeInfo: ISignInChallengeModel) => {
    const authAdapter = new AuthAdapterFromMicro();
    const userAgent = (await headers()).get('user-agent') ?? commonsConstants.unknown;
    const res = await authAdapter.signInChallenge(challengeInfo, userAgent);
    if (!res?.data) return null;

    if (!res.data.shouldVerifySession) {
        await setSessionCookie(res.data);
    }
    return res;
};

export const checkMfaAction = async (checkMfaInfo: ICheckMfaModel) => {
    const authAdapter = new AuthAdapterFromMicro();
    const res = await authAdapter.checkMfa(checkMfaInfo);
    if (!res?.data) return null;

    if (res.data.accessToken) {
        await setSessionCookie(res.data);
    }

    return res;
};

export const signOutAction = async () => {
    const authAdapter = new AuthAdapterFromMicro();

    const [accessToken] = await getSessionCookieValues();

    const res = await authAdapter.signOut(accessToken);

    return res.data;
};

export async function setSessionCookie(data: ISessionResponseDTO) {
    'use server';
    const refreshTokenData = getTokenData<IRefreshTokenDataModel>(data.refreshToken);

    const cookieStore = await cookies();
    cookieStore.set(authConstants.sessionCookieKey, `${data.accessToken}:${data.refreshToken}`, {
        httpOnly: true,
        secure: true,
        expires: new Date(refreshTokenData.exp * 1000),
        sameSite: 'strict',
        path: '/',
    });
}

export const isSessionActive = async () => {
    'use server';

    const [accessToken, refreshToken] = await getSessionCookieValues();

    if (!accessToken || !refreshToken) return false;

    return true;
};

export const getSessionCookieValues = async () => {
    const cookieStore = await cookies();
    const tokenData = cookieStore.get(authConstants.sessionCookieKey);

    const tokens = tokenData?.value?.split(':') ?? [];

    return tokens;
};
