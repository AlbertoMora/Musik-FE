import { IArtistModel } from '@/infrastructure/models/ArtistModel';
import { IActionResponse } from '../auth/auth-gateway';
import { IBasicWebResponse } from '@/types/web-types';

export interface IArtistGateway {
    getArtists: (
        name: string,
        ammount: number,
        page: number
    ) => Promise<IActionResponse<IGetArtistResponse>>;
}

export interface IGetArtistResponse extends IBasicWebResponse {
    count: number;
    artists: IArtistModel[];
}
