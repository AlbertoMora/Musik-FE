'use server';

import { AuthAdapterFromMicro } from '../auth/auth-adapter-from-micro';
import { getSessionCookieValues } from '../auth/auth-actions';
import { getResponseData, webRequest } from '@/utils/web-utils';
import { IBugMediaDTO } from '../bugs/bugs-actions';

export interface IAdminUserDTO {
    id: string;
    username: string;
    name?: string;
    lastname?: string;
    email: string;
    prof_pic?: string;
    isactive: boolean;
    ban_case_id?: string;
    isAdmin: boolean;
    isDeveloper: boolean;
    creation_date?: string;
}

export interface IBanCaseDTO {
    id: string;
    title?: string;
    player_report?: string;
    resolution?: string;
    banned_player_id?: string;
    reported_by_player_id?: string;
    is_player_banned: boolean | number;
    status: 'open' | 'Baneado' | 'Indultado' | 'No Procede' | string;
    creation_date?: string;
    resolved_at?: string;
    banned_until?: string;
    last_modified?: string;
    banned_player?: {
        id: string;
        username: string;
        email: string;
        name?: string;
        lastname?: string;
        prof_pic?: string;
        isactive?: boolean | number;
    };
    reported_by_player?: {
        id: string;
        username: string;
        email: string;
        name?: string;
        lastname?: string;
        prof_pic?: string;
    };
}

export interface IBanForumMessageDTO {
    _id: string;
    banCaseId: string;
    senderId: string;
    senderUsername: string;
    senderRole: 'reporter' | 'reported' | 'admin';
    message: string;
    media: IBugMediaDTO[];
    createdAt: string;
    updatedAt: string;
}

export const getAdminUsersServerAction = async (params?: { search?: string; role?: string }) => {
    try {
        const [accessToken] = await getSessionCookieValues();
        if (!accessToken) return { success: false, reason: 'auth05' };

        const query: Record<string, string> = {};
        if (params?.search) query.search = params.search;
        if (params?.role) query.role = params.role;

        const res = await webRequest(`${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/admin/users`).get(
            query,
            { Authorization: `Bearer ${accessToken}` },
        );

        return await getResponseData<{ status: string; users: IAdminUserDTO[] }>(res, 'adm01');
    } catch (error) {
        console.error('Error getting admin users:', error);
        return { success: false, reason: 'adm01' };
    }
};

export const updateUserRolesServerAction = async (
    userId: string,
    roles: { isAdmin?: boolean; isDeveloper?: boolean },
) => {
    try {
        const [accessToken] = await getSessionCookieValues();
        if (!accessToken) return { success: false, reason: 'auth05' };

        const res = await webRequest(
            `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/admin/users/${encodeURIComponent(userId)}/roles`,
        ).put(roles, { Authorization: `Bearer ${accessToken}` });

        return await getResponseData<{ status: string; user: IAdminUserDTO }>(res, 'adm01');
    } catch (error) {
        console.error('Error updating user roles:', error);
        return { success: false, reason: 'adm01' };
    }
};

export const getBanCasePresignedUploadServerAction = async (
    filename: string,
    contentType: string,
) => {
    try {
        const [accessToken] = await getSessionCookieValues();
        if (!accessToken) return { success: false, reason: 'auth05' };

        const res = await webRequest(
            `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/admin/ban-cases/presigned-upload`,
        ).get({ filename, contentType }, { Authorization: `Bearer ${accessToken}` });

        return await getResponseData<{ status: string; url: string; key: string }>(res, 'ban01');
    } catch (error) {
        console.error('Error getting ban case presigned url:', error);
        return { success: false, reason: 'ban01' };
    }
};

export const createBanCaseServerAction = async (payload: {
    reportedUserId: string;
    title: string;
    description: string;
    media: IBugMediaDTO[];
}) => {
    try {
        const [accessToken] = await getSessionCookieValues();
        if (!accessToken) return { success: false, reason: 'auth05' };

        const res = await webRequest(
            `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/admin/ban-cases`,
        ).post(payload, { Authorization: `Bearer ${accessToken}` });

        return await getResponseData<{ status: string; banCase: IBanCaseDTO }>(res, 'ban01');
    } catch (error) {
        console.error('Error creating ban case:', error);
        return { success: false, reason: 'ban01' };
    }
};

export const getBanCasesServerAction = async (userId?: string) => {
    try {
        const [accessToken] = await getSessionCookieValues();
        if (!accessToken) return { success: false, reason: 'auth05' };

        const query: Record<string, string> = {};
        if (userId) query.userId = userId;

        const res = await webRequest(
            `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/admin/ban-cases`,
        ).get(query, { Authorization: `Bearer ${accessToken}` });

        return await getResponseData<{
            status: string;
            banCases: IBanCaseDTO[];
            isAdmin: boolean;
        }>(res, 'ban01');
    } catch (error) {
        console.error('Error getting ban cases:', error);
        return { success: false, reason: 'ban01' };
    }
};

export const getBanCaseDetailServerAction = async (caseId: string) => {
    try {
        const [accessToken] = await getSessionCookieValues();
        if (!accessToken) return { success: false, reason: 'auth05' };

        const res = await webRequest(
            `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/admin/ban-cases/${encodeURIComponent(caseId)}`,
        ).get(undefined, { Authorization: `Bearer ${accessToken}` });

        return await getResponseData<{
            status: string;
            banCase: IBanCaseDTO;
            messages: IBanForumMessageDTO[];
            canResolve: boolean;
        }>(res, 'ban01');
    } catch (error) {
        console.error('Error getting ban case detail:', error);
        return { success: false, reason: 'ban01' };
    }
};

export const postBanCaseMessageServerAction = async (
    caseId: string,
    payload: { message: string; media: IBugMediaDTO[] },
) => {
    try {
        const [accessToken] = await getSessionCookieValues();
        if (!accessToken) return { success: false, reason: 'auth05' };

        const res = await webRequest(
            `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/admin/ban-cases/${encodeURIComponent(caseId)}/messages`,
        ).post(payload, { Authorization: `Bearer ${accessToken}` });

        return await getResponseData<{ status: string; message: IBanForumMessageDTO }>(
            res,
            'ban01',
        );
    } catch (error) {
        console.error('Error posting ban case message:', error);
        return { success: false, reason: 'ban01' };
    }
};

export const resolveBanCaseServerAction = async (
    caseId: string,
    payload: {
        verdict: 'Baneado' | 'Indultado' | 'No Procede';
        resolutionNote?: string;
    },
) => {
    try {
        const [accessToken] = await getSessionCookieValues();
        if (!accessToken) return { success: false, reason: 'auth05' };

        const res = await webRequest(
            `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/admin/ban-cases/${encodeURIComponent(caseId)}/resolve`,
        ).put(payload, { Authorization: `Bearer ${accessToken}` });

        return await getResponseData<{ status: string; banCase: IBanCaseDTO }>(res, 'ban01');
    } catch (error) {
        console.error('Error resolving ban case:', error);
        return { success: false, reason: 'ban01' };
    }
};
