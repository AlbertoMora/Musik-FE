'use server';

import {
    ISessionResponseDTO,
    ISignInChallengeModel,
    ISignUpModel,
} from '@/domain/auth/auth-gateway';
import { AuthAdapterFromMicro } from './auth-adapter-from-micro';
import { cookies } from 'next/headers';
import { getTokenData } from '@/utils/jwt-utils';
import { ISessionDataModel } from '@/infrastructure/models/SessionModel';
import { ISignInModel } from '../../../domain/auth/auth-gateway';
import { authConstants } from '@/constants/auth-constants';

export const signUpAction = async (user: ISignUpModel) => {
    const authAdapter = new AuthAdapterFromMicro();
    const data = await authAdapter.signUp(user);
    if (!data) return null;

    await setSessionCookie(data);
    return data;
};

export const signInAction = async (userInfo: ISignInModel) => {
    const authAdapter = new AuthAdapterFromMicro();
    const data = await authAdapter.signIn(userInfo);
    if (!data) return null;

    return data;
};

export const signInChallengeAction = async (challengeInfo: ISignInChallengeModel) => {
    const authAdapter = new AuthAdapterFromMicro();
    const data = await authAdapter.signInChallenge(challengeInfo);
    if (!data) return null;

    if (!data.shouldVerifySession) {
        await setSessionCookie(data);
    }
    return data;
};

const setSessionCookie = async (data: ISessionResponseDTO) => {
    const tokenData = getTokenData<ISessionDataModel>(data.accessToken);

    const cookieStore = await cookies();
    cookieStore.set(authConstants.sessionCookieKey, data.accessToken, {
        httpOnly: true,
        secure: true,
        expires: tokenData.exp,
        sameSite: 'strict',
        path: '/',
    });
};
