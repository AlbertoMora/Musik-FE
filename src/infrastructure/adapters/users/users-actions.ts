'use server';

import {
    DfaChannelType,
    IUpdateAccountModel,
    IUpdatePasswordModel,
} from '@/domain/users/users-gateway';
import { getSessionInfoAction, setSessionCookie } from '../auth/auth-actions';
import { UserFromMicroAdapter } from './users-from-micro-adapter';

export const getUsers = async (username: string, limit: number, offset: number) => {
    const usersAdapter = new UserFromMicroAdapter();
    return await usersAdapter.getUsers(username, limit, offset);
};

export const checkUserAvailabilityAction = async (params: {
    username?: string;
    email?: string;
}) => {
    const usersAdapter = new UserFromMicroAdapter();
    return await usersAdapter.checkAvailability(params);
};

export const updateUserAccountAction = async (payload: IUpdateAccountModel) => {
    const usersAdapter = new UserFromMicroAdapter();
    const res = await usersAdapter.updateAccount(payload);
    if (res.success && res.data?.accessToken) {
        await setSessionCookie(res.data);
        const updatedSession = await getSessionInfoAction();
        return {
            success: true,
            user: updatedSession?.user ?? null,
        };
    }
    return {
        success: false,
        reason: res.reason,
    };
};

export const getSecuritySettingsAction = async () => {
    const usersAdapter = new UserFromMicroAdapter();
    return await usersAdapter.getSecuritySettings();
};

export const updateDfaSettingsAction = async (dfaChannel: DfaChannelType) => {
    const usersAdapter = new UserFromMicroAdapter();
    return await usersAdapter.updateDfaSettings(dfaChannel);
};

export const updatePasswordAction = async (payload: IUpdatePasswordModel) => {
    const usersAdapter = new UserFromMicroAdapter();
    return await usersAdapter.updatePassword(payload);
};
