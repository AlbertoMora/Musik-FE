'use server';

import { ArtistsFromMicroAdapter } from './artists-from-micro-adapter';

export const getArtistsAction = async (name: string) => {
    const artistAdapter = new ArtistsFromMicroAdapter();
    const data = await artistAdapter.getArtists(name);
    return data ?? [];
};
