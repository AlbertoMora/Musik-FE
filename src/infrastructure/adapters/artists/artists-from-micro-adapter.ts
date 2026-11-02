import {
    IArtistGateway,
    IArtistSongsFilterParams,
    ICreateArtistResponse,
    IGetArtistBySlugResponse,
    IGetArtistResponse,
} from '@/domain/artists/artist-gateway';
import { SongsFromMicroAdapter } from '../songs/songs-from-micro-adapter';
import { getResponseData, webRequest } from '@/utils/web-utils';
import { ICreateArtistViewModel } from '@/presentation/viewmodels/CreateArtistViewModel';

export class ArtistsFromMicroAdapter implements IArtistGateway {
    public static readonly ARTIST_API_URI = process.env.SONG_MICRO_URI;

    public async getArtists(name: string, ammount: number, page: number) {
        try {
            const res = await webRequest(`${SongsFromMicroAdapter.SONG_API_URI}/v1/artists`).get({
                name,
                ammount: ammount.toString(),
                page: page.toString(),
            });
            return await getResponseData<IGetArtistResponse>(res, 'art01');
        } catch (error) {
            console.error('Error fetching artists:', error);
            return { success: false, reason: 'art01' };
        }
    }

    public async getArtistBySlugWithSongs(
        slug: string,
        filters: IArtistSongsFilterParams = {},
    ) {
        try {
            const params: Record<string, string> = {};
            for (const [key, value] of Object.entries(filters)) {
                if (value !== undefined && value !== null && String(value) !== '') {
                    params[key] = String(value);
                }
            }

            const res = await webRequest(
                `${SongsFromMicroAdapter.SONG_API_URI}/v1/artists/${encodeURIComponent(slug)}`,
            ).get(params);
            return await getResponseData<IGetArtistBySlugResponse>(res, 'art03');
        } catch (error) {
            console.error('Error fetching artist by slug:', error);
            return { success: false, reason: 'art03' };
        }
    }

    public async createArtist(artist: ICreateArtistViewModel, userAgent?: string) {
        try {
            const headers: HeadersInit = {};
            if (userAgent) headers['User-Agent'] = userAgent;
            const res = await webRequest(`${SongsFromMicroAdapter.SONG_API_URI}/v1/artists`).post(
                artist,
                headers,
                true,
            );
            return await getResponseData<ICreateArtistResponse>(res, 'art02');
        } catch (error) {
            console.error('Error creating Artist: ', error);
            return { success: false, reason: 'art02' };
        }
    }
}
