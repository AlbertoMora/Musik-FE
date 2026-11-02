import { IActionResponse } from '../auth/auth-gateway';
import { IBasicWebResponse } from '@/types/web-types';
import { ICreateArtistViewModel } from '@/presentation/viewmodels/CreateArtistViewModel';
import { ISongRes } from '../songs/song-gateway';

export interface IArtistSongsFilterParams {
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

export interface IArtistSongItemDTO extends ISongRes {
    last_modified?: string;
    album_id?: string | null;
    album_name?: string | null;
}

export interface IArtistSongsFacetsDTO {
    genres: string[];
    keys: string[];
    postedByUsers: string[];
    albums: string[];
}

export interface IGetArtistBySlugResponse extends IBasicWebResponse {
    artist: IArtistModel;
    count: number;
    totalArtistSongs: number;
    songs: IArtistSongItemDTO[];
    facets: IArtistSongsFacetsDTO;
}

export interface IArtistGateway {
    getArtists: (
        name: string,
        ammount: number,
        page: number,
    ) => Promise<IActionResponse<IGetArtistResponse>>;
    getArtistBySlugWithSongs: (
        slug: string,
        filters?: IArtistSongsFilterParams,
    ) => Promise<IActionResponse<IGetArtistBySlugResponse>>;
    createArtist: (
        artist: ICreateArtistViewModel,
        userAgent?: string,
    ) => Promise<IActionResponse<ICreateArtistResponse>>;
}

export interface IGetArtistResponse extends IBasicWebResponse {
    count: number;
    artists: IArtistModel[];
}

export interface ICreateArtistResponse extends IBasicWebResponse {
    artist: IArtistModel;
    slug?: string;
}

export interface IArtistModel {
    id: string;
    name: string;
    description?: string;
    image_uri?: string;
    posted_by: string;
    is_verified?: boolean;
    slug?: string;
}
