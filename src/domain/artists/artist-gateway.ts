import { IActionResponse } from '../auth/auth-gateway';
import { IBasicWebResponse } from '@/types/web-types';
import { ICreateArtistViewModel } from '@/presentation/viewmodels/CreateArtistViewModel';

export interface IArtistGateway {
    getArtists: (
        name: string,
        ammount: number,
        page: number
    ) => Promise<IActionResponse<IGetArtistResponse>>;
    createArtist: (
        artist: ICreateArtistViewModel,
        userAgent: string
    ) => Promise<IActionResponse<ICreateArtistResponse>>;
}

export interface IGetArtistResponse extends IBasicWebResponse {
    count: number;
    artists: IArtistModel[];
}

export interface ICreateArtistResponse extends IBasicWebResponse {
    artist: IArtistModel;
}

export interface IArtistModel {
    id: string;
    name: string;
    description?: string;
    image_uri?: string;
    posted_by: string;
}
