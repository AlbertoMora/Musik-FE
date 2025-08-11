import { ISongModel } from '@/infrastructure/models/SongModel';
import { ICreateSongViewModel } from '@/presentation/viewmodels/CreateSongViewModel';
import { IActionResponse } from '../auth/auth-gateway';
import { IBasicWebResponse } from '@/types/web-types';

export interface ISongGateway {
    getSongs: () => Promise<ISongModel[] | null>;
    getSong: (id: string) => Promise<IActionResponse<ISongModel>>;
    postSong: (
        song: ICreateSongViewModel,
        accessToken: string
    ) => Promise<IActionResponse<IBasicWebResponse>>;
}

export interface IGetSongResponseDTO {
    status: string;
    song: {
        id: string;
        key: string;
        bpm: number;
        creation_date: Date;
        genre: string;
        lyrics_text: string;
        name: string;
        sample_uri: string;
        fork_of?: string;
        artist_name: string;
        posted_by: string;
        fork_of_name?: string;
        avg_rate?: number;
    };
}
