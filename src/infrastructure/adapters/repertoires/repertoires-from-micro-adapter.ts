import {
    ICreateRepertoirePayload,
    ICreateRepertoireResponseDTO,
    IDeleteRepertoireResponseDTO,
    IGenerateRepertoireEditLinkResponseDTO,
    IGetRepertoireResponseDTO,
    IGetRepertoiresListResponseDTO,
    IRepertoireGateway,
    IRevokeRepertoireEditLinkResponseDTO,
    ISearchRepertoireUsersResponseDTO,
    IUpdateRepertoireEditorsResponseDTO,
    IUpdateRepertoirePayload,
    IUpdateRepertoireResponseDTO,
} from '@/domain/repertoires/repertoire-gateway';
import { getResponseData, webRequest } from '@/utils/web-utils';

export class RepertoiresFromMicroAdapter implements IRepertoireGateway {
    public static readonly SONG_API_URI = process.env.SONG_MICRO_URI;

    public async createRepertoire(payload: ICreateRepertoirePayload, accessToken: string) {
        try {
            const res = await webRequest(
                `${RepertoiresFromMicroAdapter.SONG_API_URI}/v1/repertoires`,
            ).post(payload, { Authorization: `Bearer ${accessToken}` });
            return await getResponseData<ICreateRepertoireResponseDTO>(res, 'rep01');
        } catch (error) {
            console.error('Error creating repertoire:', error);
            return { success: false, reason: 'rep01' };
        }
    }

    public async getRepertoire(id: string, accessToken?: string, linkToken?: string) {
        try {
            const headers: HeadersInit = {};
            if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
            const params: Record<string, string> | undefined = linkToken
                ? { linkToken }
                : undefined;
            const res = await webRequest(
                `${RepertoiresFromMicroAdapter.SONG_API_URI}/v1/repertoires/${id}`,
            ).get(params, headers);
            return await getResponseData<IGetRepertoireResponseDTO>(res, 'rep01');
        } catch (error) {
            console.error('Error getting repertoire:', error);
            return { success: false, reason: 'rep01' };
        }
    }

    public async getRepertoires(
        page: number,
        amount: number,
        name?: string,
        accessToken?: string,
    ) {
        try {
            const headers: HeadersInit = {};
            if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
            const params: Record<string, string> = {
                page: String(page),
                ammount: String(amount),
            };
            if (name) params.name = name;

            const res = await webRequest(
                `${RepertoiresFromMicroAdapter.SONG_API_URI}/v1/repertoires`,
            ).get(params, headers);
            return await getResponseData<IGetRepertoiresListResponseDTO>(res, 'rep01');
        } catch (error) {
            console.error('Error getting repertoires list:', error);
            return { success: false, reason: 'rep01' };
        }
    }

    public async updateRepertoire(
        id: string,
        payload: IUpdateRepertoirePayload,
        accessToken: string,
    ) {
        try {
            const res = await webRequest(
                `${RepertoiresFromMicroAdapter.SONG_API_URI}/v1/repertoires/${id}`,
            ).put(payload, { Authorization: `Bearer ${accessToken}` });
            return await getResponseData<IUpdateRepertoireResponseDTO>(res, 'rep02');
        } catch (error) {
            console.error('Error updating repertoire:', error);
            return { success: false, reason: 'rep02' };
        }
    }

    public async deleteRepertoire(id: string, accessToken: string) {
        try {
            const res = await webRequest(
                `${RepertoiresFromMicroAdapter.SONG_API_URI}/v1/repertoires`,
            ).delete(id, { Authorization: `Bearer ${accessToken}` });
            return await getResponseData<IDeleteRepertoireResponseDTO>(res, 'rep03');
        } catch (error) {
            console.error('Error deleting repertoire:', error);
            return { success: false, reason: 'rep03' };
        }
    }

    public async generateEditLink(id: string, accessToken: string) {
        try {
            const res = await webRequest(
                `${RepertoiresFromMicroAdapter.SONG_API_URI}/v1/repertoires/${id}/share-link`,
            ).post({}, { Authorization: `Bearer ${accessToken}` });
            return await getResponseData<IGenerateRepertoireEditLinkResponseDTO>(res, 'rep04');
        } catch (error) {
            console.error('Error generating repertoire edit link:', error);
            return { success: false, reason: 'rep04' };
        }
    }

    public async revokeEditLink(id: string, accessToken: string) {
        try {
            const res = await webRequest(
                `${RepertoiresFromMicroAdapter.SONG_API_URI}/v1/repertoires/${id}/share-link`,
            ).delete(null, { Authorization: `Bearer ${accessToken}` });
            return await getResponseData<IRevokeRepertoireEditLinkResponseDTO>(res, 'rep05');
        } catch (error) {
            console.error('Error revoking repertoire edit link:', error);
            return { success: false, reason: 'rep05' };
        }
    }

    public async searchUsersForRepertoire(id: string, query: string, accessToken: string) {
        try {
            const res = await webRequest(
                `${RepertoiresFromMicroAdapter.SONG_API_URI}/v1/repertoires/${id}/users-search`,
            ).get({ q: query }, { Authorization: `Bearer ${accessToken}` });
            return await getResponseData<ISearchRepertoireUsersResponseDTO>(res, 'rep06');
        } catch (error) {
            console.error('Error searching users for repertoire:', error);
            return { success: false, reason: 'rep06' };
        }
    }

    public async addEditor(
        id: string,
        payload: { userId?: string; identifier?: string },
        accessToken: string,
    ) {
        try {
            const res = await webRequest(
                `${RepertoiresFromMicroAdapter.SONG_API_URI}/v1/repertoires/${id}/editors`,
            ).post(payload, { Authorization: `Bearer ${accessToken}` });
            return await getResponseData<IUpdateRepertoireEditorsResponseDTO>(res, 'rep06');
        } catch (error) {
            console.error('Error adding repertoire editor:', error);
            return { success: false, reason: 'rep06' };
        }
    }

    public async removeEditor(id: string, editorUserId: string, accessToken: string) {
        try {
            const res = await webRequest(
                `${RepertoiresFromMicroAdapter.SONG_API_URI}/v1/repertoires/${id}/editors`,
            ).delete(editorUserId, { Authorization: `Bearer ${accessToken}` });
            return await getResponseData<IUpdateRepertoireEditorsResponseDTO>(res, 'rep07');
        } catch (error) {
            console.error('Error removing repertoire editor:', error);
            return { success: false, reason: 'rep07' };
        }
    }
}
