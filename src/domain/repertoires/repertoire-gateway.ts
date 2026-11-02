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
    linkToken?: string;
}

export interface IRepertoireEditorDTO {
    id: string;
    username: string;
    email: string;
    name?: string;
    lastname?: string;
}

export interface IRepertoireDTO {
    _id: string;
    name: string;
    userId: string;
    ownerUsername?: string;
    lyrics: string[];
    editors?: string[];
    editLinkToken?: string | null;
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
    editors?: IRepertoireEditorDTO[];
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

export interface IGenerateRepertoireEditLinkResponseDTO extends IBasicWebResponse {
    editLinkToken: string;
    slug: string;
}

export interface IRevokeRepertoireEditLinkResponseDTO extends IBasicWebResponse {
    revoked: boolean;
}

export interface ISearchRepertoireUsersResponseDTO extends IBasicWebResponse {
    users: IRepertoireEditorDTO[];
}

export interface IUpdateRepertoireEditorsResponseDTO extends IBasicWebResponse {
    editors: IRepertoireEditorDTO[];
}

export interface IRepertoireGateway {
    createRepertoire: (
        payload: ICreateRepertoirePayload,
        accessToken: string,
    ) => Promise<IActionResponse<ICreateRepertoireResponseDTO>>;
    getRepertoire: (
        id: string,
        accessToken?: string,
        linkToken?: string,
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
    generateEditLink: (
        id: string,
        accessToken: string,
    ) => Promise<IActionResponse<IGenerateRepertoireEditLinkResponseDTO>>;
    revokeEditLink: (
        id: string,
        accessToken: string,
    ) => Promise<IActionResponse<IRevokeRepertoireEditLinkResponseDTO>>;
    searchUsersForRepertoire: (
        id: string,
        query: string,
        accessToken: string,
    ) => Promise<IActionResponse<ISearchRepertoireUsersResponseDTO>>;
    addEditor: (
        id: string,
        payload: { userId?: string; identifier?: string },
        accessToken: string,
    ) => Promise<IActionResponse<IUpdateRepertoireEditorsResponseDTO>>;
    removeEditor: (
        id: string,
        editorUserId: string,
        accessToken: string,
    ) => Promise<IActionResponse<IUpdateRepertoireEditorsResponseDTO>>;
}
