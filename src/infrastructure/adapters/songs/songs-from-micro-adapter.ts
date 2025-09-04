import { IKey, ISongModel } from '@/infrastructure/models/SongModel';
import {
    ICreateSongResponseDTO,
    IGetSongResponseDTO,
    IGetSongsListResponseDTO,
    ISongGateway,
} from '../../../domain/songs/song-gateway';
import { extractBracedValues } from '@/utils/text-utils';
import { ICreateSongViewModel } from '@/presentation/viewmodels/CreateSongViewModel';
import { getResponseData, webRequest } from '@/utils/web-utils';

export class SongsFromMicroAdapter implements ISongGateway {
    public static readonly SONG_API_URI = process.env.SONG_MICRO_URI;

    public async getSongs() {
        return null;
    }

    public async getSong(id: string) {
        try {
            const res = await webRequest(
                `${SongsFromMicroAdapter.SONG_API_URI}/v1/songs/${id}`
            ).get();
            const data = await getResponseData<IGetSongResponseDTO>(res, 'sng02');
            if (!data.data || !data.success) return { success: false, reason: 'sng02' };
            return { success: true, data: this.wrapSongDTO(data.data?.song) };
        } catch (e) {
            console.log(e);
            return { success: false, reason: 'sng02' };
        }
    }

    public async postSong(song: ICreateSongViewModel, accessToken: string) {
        try {
            const res = await webRequest(`${SongsFromMicroAdapter.SONG_API_URI}/v1/songs`).post(
                song,
                { Authorization: `Bearer ${accessToken}` }
            );
            return getResponseData<ICreateSongResponseDTO>(res, 'sng01');
        } catch (error) {
            console.error('Error posting song:', error);
            return { success: false, reason: 'sng01' };
        }
    }

    public async getSongByName(name: string, limit: number, offset: number) {
        try {
            const res = await webRequest(
                `${SongsFromMicroAdapter.SONG_API_URI}/v1/songs/by-name`
            ).get({ name, limit: limit.toString(), offset: offset.toString() });
            return getResponseData<IGetSongsListResponseDTO>(res, 'sng04');
        } catch (error) {
            console.error('Error posting song:', error);
            return { success: false, reason: 'sng04' };
        }
    }

    private wrapSongDTO(song: IGetSongResponseDTO['song']): ISongModel {
        const songModel: ISongModel = {
            postedBy: song.posted_by ?? '',
            averageScore: song.avg_rate ?? 0,
            artist: song.artist_name,
            forkOf: song.fork_of,
            id: song.id,
            chords: extractBracedValues(song.lyrics_text).map(
                key =>
                    ({
                        position: key.position,
                        key: key.value,
                        line: key.line,
                    } as IKey)
            ),
            lyrics: song.lyrics_text,
            title: song.name,
            genre: song.genre ?? '',
            sampleUri: song.sample_uri,
            bpm: song.bpm ?? 0,
            songKey: song.key ?? '',
        };
        return songModel;
    }
}
