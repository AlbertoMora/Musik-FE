'use server';

import {
    ICreateRepertoirePayload,
    IUpdateRepertoirePayload,
} from '@/domain/repertoires/repertoire-gateway';
import { getSessionCookieValues } from '../auth/auth-actions';
import { RepertoiresFromMicroAdapter } from './repertoires-from-micro-adapter';

export const createRepertoireAction = async (payload: ICreateRepertoirePayload) => {
    const adapter = new RepertoiresFromMicroAdapter();
    const [accessToken] = await getSessionCookieValues();
    if (!accessToken) {
        return { success: false, reason: 'auth05' };
    }
    return await adapter.createRepertoire(payload, accessToken);
};

export const getRepertoireAction = async (id: string) => {
    const adapter = new RepertoiresFromMicroAdapter();
    const [accessToken] = await getSessionCookieValues();
    return await adapter.getRepertoire(id, accessToken);
};

export const getRepertoiresAction = async (
    page: number = 0,
    amount: number = 10,
    name?: string,
) => {
    const adapter = new RepertoiresFromMicroAdapter();
    const [accessToken] = await getSessionCookieValues();
    return await adapter.getRepertoires(page, amount, name, accessToken);
};

export const updateRepertoireAction = async (id: string, payload: IUpdateRepertoirePayload) => {
    const adapter = new RepertoiresFromMicroAdapter();
    const [accessToken] = await getSessionCookieValues();
    if (!accessToken) {
        return { success: false, reason: 'auth05' };
    }
    return await adapter.updateRepertoire(id, payload, accessToken);
};

export const deleteRepertoireAction = async (id: string) => {
    const adapter = new RepertoiresFromMicroAdapter();
    const [accessToken] = await getSessionCookieValues();
    if (!accessToken) {
        return { success: false, reason: 'auth05' };
    }
    return await adapter.deleteRepertoire(id, accessToken);
};
