import { IActionResponse } from '../auth/auth-gateway';
import { IBasicWebResponse } from '@/types/web-types';
import { ISongRes } from '../songs/song-gateway';

export interface IEditorModel {
    id: string;
    username: string;
    name?: string;
    lastname?: string;
    prof_pic?: string;
    creation_date?: string;
    slug?: string;
}

export interface IEditorSongsFilterParams {
    page?: number;
    limit?: number;
    id?: string;
    name?: string;
    lyrics_text?: string;
    genre?: string;
    key?: string;
    bpmMin?: string;
    bpmMax?: string;
    hasSample?: 'all' | 'yes' | 'no';
    artist_id?: string;
    posted_by?: string;
    fork_of?: string;
    album_id?: string;
    creationDateFrom?: string;
    creationDateTo?: string;
    lastModifiedFrom?: string;
    lastModifiedTo?: string;
    sortBy?:
        | 'id'
        | 'name'
        | 'lyrics_text'
        | 'genre'
        | 'sample_uri'
        | 'bpm'
        | 'key'
        | 'artist_id'
        | 'posted_by'
        | 'fork_of'
        | 'creation_date'
        | 'last_modified'
        | 'album_id';
    sortDir?: 'ASC' | 'DESC';
}

export interface IEditorSongItemDTO extends ISongRes {
    last_modified?: string;
    album_id?: string | null;
    album_name?: string | null;
    artist_id?: string;
    artist_slug?: string;
}

export interface IEditorSongsFacetsDTO {
    genres: string[];
    keys: string[];
    artists: string[];
    albums: string[];
}

export interface IGetEditorBySlugResponse extends IBasicWebResponse {
    editor: IEditorModel;
    isSelf: boolean;
    count: number;
    totalEditorSongs: number;
    songs: IEditorSongItemDTO[];
    facets: IEditorSongsFacetsDTO;
}

export interface IEditorGateway {
    getEditorBySlugWithSongs: (
        slug: string,
        filters?: IEditorSongsFilterParams,
        accessToken?: string,
    ) => Promise<IActionResponse<IGetEditorBySlugResponse>>;
}
