'use server';

import { ICreateArtistViewModel } from '@/presentation/viewmodels/CreateArtistViewModel';
import { ArtistsFromMicroAdapter } from './artists-from-micro-adapter';

export const getArtistsAction = async (name: string, ammount: number, page: number) => {
    const artistAdapter = new ArtistsFromMicroAdapter();
    const data = await artistAdapter.getArtists(name, ammount, page);
    return data;
};

export const createArtistAction = async (artist: ICreateArtistViewModel) => {
    const artistAdapter = new ArtistsFromMicroAdapter();
    const res = await artistAdapter.createArtist(artist);
    return res;
};
