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
    const [accessToken] = await getSessionCookieValues();

    const res = await songAdapter.getSong(id, accessToken);

    return res;
};

export const postRecordAction = async (filename: string, contentType: string, id: string) => {
    const songAdapter = new SongsFromMicroAdapter();
    const [accessToken] = await getSessionCookieValues();

    const res = await songAdapter.postRecord(filename, contentType, id, accessToken);
    return res;
};

export const updateSongSampleAction = async (key: string, id: string) => {
    const songAdapter = new SongsFromMicroAdapter();
    const [accessToken] = await getSessionCookieValues();

    const res = await songAdapter.updateSongSample(key, id, accessToken);
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
