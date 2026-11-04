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
        type?: string,
    ) => Promise<IActionResponse<IGetSongsListResponseDTO>>;
    getUserSongHistory: (
        limit: number,
        offset: number,
        accessToken: string,
    ) => Promise<IActionResponse<IUserSongHistoryResponseDTO>>;
    postSong: (
        song: ICreateSongViewModel,
        accessToken: string,
    ) => Promise<IActionResponse<ICreateSongResponseDTO>>;
    postRecord: (
        filename: string,
        contentType: string,
        id: string,
        accessToken: string,
    ) => Promise<IActionResponse<IPostRecordResDTO>>;
    updateSongSample: (
        key: string,
        id: string,
        accessToken: string,
    ) => Promise<IActionResponse<IUpdateSongSampleResDTO>>;
    softDeleteSong: (
        id: string,
        accessToken: string,
    ) => Promise<IActionResponse<ISoftDeleteSongResDTO>>;
    getSongComments: (
        songId: string,
        accessToken?: string,
    ) => Promise<IActionResponse<IGetSongCommentsResponseDTO>>;
    postSongComment: (
        songId: string,
        rating: number,
        comment: string,
        accessToken: string,
    ) => Promise<IActionResponse<IPostSongCommentResponseDTO>>;
    deleteSongComment: (
        songId: string,
        commentId: string,
        accessToken: string,
    ) => Promise<IActionResponse<IDeleteSongCommentResponseDTO>>;
}

export interface ISongCommentItemDTO {
    id: string;
    songId: string;
    userId: string;
    username: string;
    userAvatar?: string | null;
    userSlug?: string;
    rating: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
    isOwn?: boolean;
}

export interface IGetSongCommentsResponseDTO extends IBasicWebResponse {
    songId: string;
    averageRating: number;
    totalComments: number;
    distribution: Record<number, number>;
    comments: ISongCommentItemDTO[];
}

export interface IPostSongCommentResponseDTO extends IBasicWebResponse {
    averageRating: number;
    totalComments: number;
    distribution: Record<number, number>;
    comment: ISongCommentItemDTO;
}

export interface IDeleteSongCommentResponseDTO extends IBasicWebResponse {
    deletedCommentId: string;
    averageRating: number;
    totalComments: number;
    distribution: Record<number, number>;
}

export interface ISoftDeleteSongResDTO extends IBasicWebResponse {
    deletedId: string;
}

export interface ISongHistoryItemDTO {
    id: string;
    songId: string;
    songName: string;
    songKey: string | null;
    songGenre: string | null;
    artistId: string;
    artistName: string;
    slug: string;
    viewedAt: string;
}

export interface IUserSongHistoryResponseDTO extends IBasicWebResponse {
    stats: {
        sitesVisited: number;
        historyRecords: number;
        lastVisit: string | null;
    };
    count: number;
    history: ISongHistoryItemDTO[];
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
    sample_url?: string | null;
    fork_of?: string;
    artist_name: string;
    posted_by: string;
    fork_of_name?: string;
    avg_rate?: number;
    ratings_count?: number;
    slug?: string;
}

export interface IGetSongsListResponseDTO {
    status: string;
    songs: ISongRes[];
}
