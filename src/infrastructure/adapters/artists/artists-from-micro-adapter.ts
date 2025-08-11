import { IArtistGateway, IGetArtistResponse } from '@/domain/artists/artist-gateway';
import { SongsFromMicroAdapter } from '../songs/songs-from-micro-adapter';
import { getResponseData, webRequest } from '@/utils/web-utils';

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
}
