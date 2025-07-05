import { SongFromMicroDTO } from '@/infrastructure/adapters/songs/songs-from-micro-adapter';
import { ISongModel } from '@/infrastructure/models/SongModel';

export interface ISongGateway {
    getSongs: () => Promise<ISongModel[] | null>;
    getSong: (id: string) => Promise<ISongModel | null>;
    postSong: (song: Omit<SongFromMicroDTO, 'id'>) => Promise<boolean>;
}
