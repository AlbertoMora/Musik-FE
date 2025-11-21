import { ISongModel, ISongPermission } from '@/infrastructure/models/SongModel';
import { ICreateSongViewModel } from '@/presentation/viewmodels/CreateSongViewModel';
import { IActionResponse } from '../auth/auth-gateway';
import { IBasicWebResponse } from '@/types/web-types';

export interface ISongGateway {
    getSongs: () => Promise<ISongModel[] | null>;
    getSong: (id: string, accessToken?: string) => Promise<IActionResponse<ISongModel>>;
    getSongByName: (
        name: string,
        limit: number,
        offset: number,
        type?: string
    ) => Promise<IActionResponse<IGetSongsListResponseDTO>>;
    postSong: (
        song: ICreateSongViewModel,
        accessToken: string
    ) => Promise<IActionResponse<ICreateSongResponseDTO>>;
    postRecord: (
        filename: string,
        contentType: string,
        id: string,
        accessToken: string
    ) => Promise<IActionResponse<IPostRecordResDTO>>;
    updateSongSample: (
        key: string,
        id: string,
        accessToken: string
    ) => Promise<IActionResponse<IUpdateSongSampleResDTO>>;
}

export interface IPostRecordResDTO extends IBasicWebResponse {
    url: string;
    key: string;
}

export interface IUpdateSongSampleResDTO extends IBasicWebResponse {
    url: string;
}
export interface IGetSongResponseDTO {
    status: string;
    song: ISongRes;
    slug?: string;
    url: string | null;
    permissions: ISongPermission[] | null;
}

export interface ICreateSongResponseDTO extends IBasicWebResponse {
    slug: string;
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
