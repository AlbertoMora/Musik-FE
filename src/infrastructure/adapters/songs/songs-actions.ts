'use server';
import { ICreateSongViewModel } from '@/presentation/viewmodels/CreateSongViewModel';
import { SongsFromMicroAdapter } from './songs-from-micro-adapter';
import { getSessionCookieValues } from '../auth/auth-actions';

export const postSongAction = async (song: ICreateSongViewModel) => {
    const songsAdapter = new SongsFromMicroAdapter();
    const [accessToken] = await getSessionCookieValues();

    return await songsAdapter.postSong(song, accessToken);
};

export const getSongAction = async (id: string) => {
    const songAdapter = new SongsFromMicroAdapter();
    const res = await songAdapter.getSong(id);

    return res;
};

export const getSongsByNameAction = async (
    name: string,
    limit: number,
    offset: number = 0,
    type?: string
) => {
    const songAdapter = new SongsFromMicroAdapter();
    return await songAdapter.getSongByName(name, limit, offset, type);
};
