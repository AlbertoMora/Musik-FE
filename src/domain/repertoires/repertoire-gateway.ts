import { IActionResponse } from '../auth/auth-gateway';
import { ISongRes } from '../songs/song-gateway';
import { ISongPermission } from '@/infrastructure/models/SongModel';
import { IBasicWebResponse } from '@/types/web-types';

export interface ICreateRepertoirePayload {
    name: string;
    lyrics: string[];
}

export interface IUpdateRepertoirePayload {
    name?: string;
    lyrics?: string[];
}

export interface IRepertoireDTO {
    _id: string;
    name: string;
    userId: string;
    lyrics: string[];
    creationDate: string;
    lastModified: string;
    slug?: string;
}

export interface ICreateRepertoireResponseDTO extends IBasicWebResponse {
    repertoireId: string;
    repertoire: IRepertoireDTO;
    slug: string;
}

export interface IGetRepertoireResponseDTO extends IBasicWebResponse {
    repertoire: IRepertoireDTO;
    songs: ISongRes[];
    slug?: { slug: string; id: string };
    permissions: ISongPermission[] | null;
}

export interface IGetRepertoiresListResponseDTO extends IBasicWebResponse {
    count: number;
    repertoires: IRepertoireDTO[];
}

export interface IUpdateRepertoireResponseDTO extends IBasicWebResponse {
    repertoire: IRepertoireDTO;
}

export interface IDeleteRepertoireResponseDTO extends IBasicWebResponse {
    deletedId: string;
}

export interface IRepertoireGateway {
    createRepertoire: (
        payload: ICreateRepertoirePayload,
        accessToken: string,
    ) => Promise<IActionResponse<ICreateRepertoireResponseDTO>>;
    getRepertoire: (
        id: string,
        accessToken?: string,
    ) => Promise<IActionResponse<IGetRepertoireResponseDTO>>;
    getRepertoires: (
        page: number,
        amount: number,
        name?: string,
        accessToken?: string,
    ) => Promise<IActionResponse<IGetRepertoiresListResponseDTO>>;
    updateRepertoire: (
        id: string,
        payload: IUpdateRepertoirePayload,
        accessToken: string,
    ) => Promise<IActionResponse<IUpdateRepertoireResponseDTO>>;
    deleteRepertoire: (
        id: string,
        accessToken: string,
    ) => Promise<IActionResponse<IDeleteRepertoireResponseDTO>>;
}
