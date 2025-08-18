import { IUserListResponseDTO, IUsersGateway } from '@/domain/users/users-gateway';
import { AuthAdapterFromMicro } from '../auth/auth-adapter-from-micro';
import { getResponseData, webRequest } from '@/utils/web-utils';

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
            console.error('Error posting song:', error);
            return { success: false, reason: 'usr01' };
        }
    }
}
