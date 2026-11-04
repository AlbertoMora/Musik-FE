import {
    IEditorGateway,
    IEditorSongsFilterParams,
    IGetEditorBySlugResponse,
} from '@/domain/editors/editor-gateway';
import { SongsFromMicroAdapter } from '../songs/songs-from-micro-adapter';
import { getResponseData, webRequest } from '@/utils/web-utils';

export class EditorsFromMicroAdapter implements IEditorGateway {
    public async getEditorBySlugWithSongs(
        slug: string,
        filters: IEditorSongsFilterParams = {},
        accessToken?: string,
    ) {
        try {
            const params: Record<string, string> = {};
            for (const [key, value] of Object.entries(filters)) {
                if (value !== undefined && value !== null && String(value) !== '') {
                    params[key] = String(value);
                }
            }

            const headers: HeadersInit = {};
            if (accessToken) {
                headers.Authorization = `Bearer ${accessToken}`;
            }

            const res = await webRequest(
                `${SongsFromMicroAdapter.SONG_API_URI}/v1/editors/${encodeURIComponent(slug)}`,
            ).get(params, headers);
            return await getResponseData<IGetEditorBySlugResponse>(res, 'edt01');
        } catch (error) {
            console.error('Error fetching editor by slug:', error);
            return { success: false, reason: 'edt01' };
        }
    }
}
