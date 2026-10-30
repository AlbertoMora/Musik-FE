import {
    DfaChannelType,
    IActiveSessionsResponseDTO,
    ICheckAvailabilityResponseDTO,
    IRevokeSessionResponseDTO,
    ISecuritySettingsResponseDTO,
    IUpdateAccountModel,
    IUpdateDfaResponseDTO,
    IUpdatePasswordModel,
    IUpdatePasswordResponseDTO,
    IUserListResponseDTO,
    IUsersGateway,
} from '@/domain/users/users-gateway';
import { AuthAdapterFromMicro } from '../auth/auth-adapter-from-micro';
import { getResponseData, webRequest } from '@/utils/web-utils';
import { getSessionCookieValues } from '../auth/auth-actions';
import { ISessionResponseDTO } from '@/domain/auth/auth-gateway';

export class UserFromMicroAdapter implements IUsersGateway {
    public async getUsers(username: string, limit?: number, offset?: number) {
        try {
            const res = await webRequest(`${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/users/`).get({
                username: username,
                limit: String(limit),
                offset: String(offset),
            });
            return getResponseData<IUserListResponseDTO>(res, 'usr01');
        } catch (error) {
            console.error('Error getting users:', error);
            return { success: false, reason: 'usr01' };
        }
    }

    public async checkAvailability(params: { username?: string; email?: string }) {
        try {
            const [accessToken] = await getSessionCookieValues();
            const query: Record<string, string> = {};
            if (params.username) query.username = params.username;
            if (params.email) query.email = params.email;

            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/users/availability`,
            ).get(query, accessToken ? { authorization: `Bearer ${accessToken}` } : undefined);
            return getResponseData<ICheckAvailabilityResponseDTO>(res, 'usr01');
        } catch (error) {
            console.error('Error checking availability:', error);
            return { success: false, reason: 'usr01' };
        }
    }

    public async updateAccount(payload: IUpdateAccountModel) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/users/account`,
            ).put(payload, undefined, true);
            return getResponseData<ISessionResponseDTO>(res, 'usr01');
        } catch (error) {
            console.error('Error updating account:', error);
            return { success: false, reason: 'usr01' };
        }
    }

    public async getSecuritySettings() {
        try {
            const [accessToken] = await getSessionCookieValues();
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/users/security`,
            ).get(undefined, accessToken ? { authorization: `Bearer ${accessToken}` } : undefined);
            return getResponseData<ISecuritySettingsResponseDTO>(res, 'usr01');
        } catch (error) {
            console.error('Error getting security settings:', error);
            return { success: false, reason: 'usr01' };
        }
    }

    public async updateDfaSettings(dfaChannel: DfaChannelType) {
        try {
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/users/security/dfa`,
            ).put({ dfaChannel }, undefined, true);
            return getResponseData<IUpdateDfaResponseDTO>(res, 'usr01');
        } catch (error) {
            console.error('Error updating DFA settings:', error);
            return { success: false, reason: 'usr01' };
        }
    }

    public async updatePassword(payload: IUpdatePasswordModel, userAgent?: string) {
        try {
            const headers: Record<string, string> = {};
            if (userAgent) headers['User-Agent'] = userAgent;

            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/users/security/password`,
            ).put(payload, headers, true);
            return getResponseData<IUpdatePasswordResponseDTO>(res, 'usr01');
        } catch (error) {
            console.error('Error updating password:', error);
            return { success: false, reason: 'usr01' };
        }
    }

    public async getActiveSessions(deviceId?: string, userAgent?: string, clientIp?: string) {
        try {
            const [accessToken] = await getSessionCookieValues();
            const headers: Record<string, string> = {};
            if (accessToken) headers.authorization = `Bearer ${accessToken}`;
            if (userAgent) headers['User-Agent'] = userAgent;
            if (deviceId) headers.deviceid = deviceId;
            if (clientIp) headers['x-client-ip'] = clientIp;

            const query: Record<string, string> = {};
            if (deviceId) query.deviceId = deviceId;
            if (clientIp) query.clientIp = clientIp;

            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/users/sessions`,
            ).get(Object.keys(query).length ? query : undefined, headers);
            return getResponseData<IActiveSessionsResponseDTO>(res, 'usr01');
        } catch (error) {
            console.error('Error getting active sessions:', error);
            return { success: false, reason: 'usr01' };
        }
    }

    public async revokeSession(sessionId: string) {
        try {
            const [accessToken] = await getSessionCookieValues();
            const res = await webRequest(
                `${AuthAdapterFromMicro.AUTH_MICRO_URI}/v1/users/sessions`,
            ).delete(sessionId, accessToken ? { authorization: `Bearer ${accessToken}` } : undefined);
            return getResponseData<IRevokeSessionResponseDTO>(res, 'usr01');
        } catch (error) {
            console.error('Error revoking session:', error);
            return { success: false, reason: 'usr01' };
        }
    }
}
