import { IRythmsGateway } from '@/domain/rythms/rythms-gateway';
import { IRythmModel } from '@/infrastructure/models/RythmModel';

export class RythmsFromMicroAdapter implements IRythmsGateway {
    public static readonly RYTHM_API_URI = process.env.SONG_MICRO_URI;

    public async getRythms(name: string): Promise<IRythmModel[] | null> {
        try {
            const response = await fetch(
                `${RythmsFromMicroAdapter.RYTHM_API_URI}/v1/rythms?name=${encodeURIComponent(name)}`
            );
            const rythms = await response.json();
            if (!response.ok || !rythms) {
                return null;
            }
            return rythms.map((rythm: RythmsFromMicroDTO) => ({
                id: rythm.id,
                name: rythm.name,
                imageUrl: rythm.photo_uri || '',
            }));
        } catch (error) {
            console.error('Error fetching rythms:', error);
            return null;
        }
    }
}

interface RythmsFromMicroDTO {
    id: string;
    name: string;
    photo_uri: string;
}
