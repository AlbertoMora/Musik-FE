'use server';

import { AuthAdapterFromMicro } from '../auth/auth-adapter-from-micro';
import { getSessionCookieValues } from '../auth/auth-actions';
import { getResponseData, webRequest } from '@/utils/web-utils';

export type BugStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface IBugMediaDTO {
    key: string;
    url?: string;
    name: string;
    type: string;
    size: number;
}

export interface IBugDTO {
    _id: string;
    title: string;
    description: string;
    media: IBugMediaDTO[];
    reportedBy: {
        userId: string;
        username: string;
        email?: string;
    };
    assignedTo: string | null;
    assignedToUsername: string | null;
    status: BugStatus;
    createdAt: string;
    updatedAt: string;
}

export interface IDeveloperUserDTO {
    id: string;
    username: string;
    name?: string;
    lastname?: string;
    email: string;
    prof_pic?: string;
}

export const getBugPresignedUploadAction = async (filename: string, contentType: string) => {
    try {
        const [accessToken] = await getSessionCookieValues();
        if (!accessToken) return { success: false, reason: 'auth05' };

        const res = await webRequest(
            `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/bugs/presigned-upload`,
        ).get({ filename, contentType }, { Authorization: `Bearer ${accessToken}` });

        return await getResponseData<{ status: string; url: string; key: string }>(res, 'bug01');
    } catch (error) {
        console.error('Error getting bug presigned upload url:', error);
        return { success: false, reason: 'bug01' };
    }
};

export const createBugReportAction = async (payload: {
    title: string;
    description: string;
    media: IBugMediaDTO[];
}) => {
    try {
        const [accessToken] = await getSessionCookieValues();
        if (!accessToken) return { success: false, reason: 'auth05' };

        const res = await webRequest(`${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/bugs/`).post(
            payload,
            { Authorization: `Bearer ${accessToken}` },
        );

        return await getResponseData<{ status: string; bug: IBugDTO }>(res, 'bug01');
    } catch (error) {
        console.error('Error creating bug report:', error);
        return { success: false, reason: 'bug01' };
    }
};

export const getBugsListAction = async (params?: { status?: string; search?: string }) => {
    try {
        const [accessToken] = await getSessionCookieValues();
        if (!accessToken) return { success: false, reason: 'auth05' };

        const query: Record<string, string> = {};
        if (params?.status) query.status = params.status;
        if (params?.search) query.search = params.search;

        const res = await webRequest(`${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/bugs/`).get(query, {
            Authorization: `Bearer ${accessToken}`,
        });

        return await getResponseData<{
            status: string;
            bugs: IBugDTO[];
            developers: IDeveloperUserDTO[];
            role: 'admin' | 'developer';
        }>(res, 'bug01');
    } catch (error) {
        console.error('Error getting bugs:', error);
        return { success: false, reason: 'bug01' };
    }
};

export const updateBugStatusServerAction = async (bugId: string, status: BugStatus) => {
    try {
        const [accessToken] = await getSessionCookieValues();
        if (!accessToken) return { success: false, reason: 'auth05' };

        const res = await webRequest(
            `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/bugs/${encodeURIComponent(bugId)}/status`,
        ).put({ status }, { Authorization: `Bearer ${accessToken}` });

        return await getResponseData<{ status: string; bug: IBugDTO }>(res, 'bug01');
    } catch (error) {
        console.error('Error updating bug status:', error);
        return { success: false, reason: 'bug01' };
    }
};

export const assignBugServerAction = async (bugId: string, developerId: string | null) => {
    try {
        const [accessToken] = await getSessionCookieValues();
        if (!accessToken) return { success: false, reason: 'auth05' };

        const res = await webRequest(
            `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/bugs/${encodeURIComponent(bugId)}/assign`,
        ).put({ developerId }, { Authorization: `Bearer ${accessToken}` });

        return await getResponseData<{ status: string; bug: IBugDTO }>(res, 'bug01');
    } catch (error) {
        console.error('Error assigning bug:', error);
        return { success: false, reason: 'bug01' };
    }
};
