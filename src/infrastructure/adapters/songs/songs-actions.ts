'use server';
import { ICreateSongViewModel } from '@/presentation/viewmodels/CreateSongViewModel';
import { SongFromMicroDTO, SongsFromMicroAdapter } from './songs-from-micro-adapter';

export const postSongAction = async (song: ICreateSongViewModel): Promise<boolean> => {
    const songDTO: Omit<SongFromMicroDTO, 'id' | 'posted_by'> = {
        average_score: 0,
        artist: song.artist,
        fork_of: song.forkOf,
        lyrics: song.lyrics,
        name: song.title,
        genre: song.genre,
        sample_uri: song.sampleUri,
        bpm: song.bpm,
        key: song.key,
    };
    const songsAdapter = new SongsFromMicroAdapter();
    return await songsAdapter.postSong(songDTO);
};
