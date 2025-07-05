import { IArtistModel } from '@/infrastructure/models/ArtistModel';

export interface IArtistGateway {
    getArtists: (name: string) => Promise<IArtistModel[] | null>;
}
