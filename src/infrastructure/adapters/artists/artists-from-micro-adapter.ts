import { IArtistGateway } from '@/domain/artists/artist-gateway';
import { IArtistModel } from '@/infrastructure/models/ArtistModel';

export class ArtistsFromMicroAdapter implements IArtistGateway {
    public static readonly ARTIST_API_URI = process.env.SONG_MICRO_URI;

    public async getArtists(name: string): Promise<IArtistModel[] | null> {
        try {
            const response = await fetch(
                `${ArtistsFromMicroAdapter.ARTIST_API_URI}/v1/artists?name=${encodeURIComponent(
                    name
                )}`
            );
            const artists = await response.json();
            if (!response.ok || !artists) {
                return null;
            }
            return artists.map((artist: ArtistFromMicroDTO) => ({
                id: artist.id,
                name: artist.name,
                imageUrl: artist.photo || '',
            }));
        } catch (error) {
            console.error('Error fetching artists:', error);
            return null;
        }
    }
}

interface ArtistFromMicroDTO {
    id: string;
    name: string;
    photo: string;
}
