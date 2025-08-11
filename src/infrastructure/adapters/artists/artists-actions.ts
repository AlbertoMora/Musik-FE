'use server';

import { ArtistsFromMicroAdapter } from './artists-from-micro-adapter';

export const getArtistsAction = async (name: string, ammount: number, page: number) => {
    const artistAdapter = new ArtistsFromMicroAdapter();
    const data = await artistAdapter.getArtists(name, ammount, page);
    return data;
};
