import { ISongModel } from '@/infrastructure/models/SongModel';
import { ICreateSongViewModel } from '@/presentation/viewmodels/CreateSongViewModel';
import { IActionResponse } from '../auth/auth-gateway';
import { IBasicWebResponse } from '@/types/web-types';

export interface ISongGateway {
    getSongs: () => Promise<ISongModel[] | null>;
    getSong: (id: string) => Promise<IActionResponse<ISongModel>>;
    getSongByName: (
        name: string,
        limit: number,
        offset: number
    ) => Promise<IActionResponse<IGetSongsListResponseDTO>>;
    postSong: (
        song: ICreateSongViewModel,
        accessToken: string
    ) => Promise<IActionResponse<IBasicWebResponse>>;
}

export interface IGetSongResponseDTO {
    status: string;
    song: ISongRes;
}

export interface ISongRes {
    id: string;
    key: string;
    bpm: number;
    creation_date: Date;
    genre: string;
    lyrics_text: string;
    name: string;
    sample_uri: string;
    fork_of?: string;
    artist_name: string;
    posted_by: string;
    fork_of_name?: string;
    avg_rate?: number;
}

export interface IGetSongsListResponseDTO {
    status: string;
    songs: ISongRes[];
}
