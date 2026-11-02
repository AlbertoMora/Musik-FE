import { getI18n } from '@/i18n/dictionaries';
import { getArtistBySlugWithSongsAction } from '@/infrastructure/adapters/artists/artists-actions';
import ArtistSongsCatalogClient from '@/presentation/components/artists/ArtistSongsCatalogClient';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import React, { cache } from 'react';

import '@/presentation/styles/pages/create-song.sass';
import '@/presentation/styles/pages/repertoires.sass';
import '@/presentation/styles/components/forms.sass';

interface ArtistPageParams {
    params: Promise<{ slug: string }>;
}

const getInitialArtistCatalog = cache(async (slug: string) => {
    const res = await getArtistBySlugWithSongsAction(slug, {
        page: 0,
        limit: 9,
        sortBy: 'creation_date',
        sortDir: 'DESC',
    });
    if (!res.success || !res.data || !res.data.artist) {
        return null;
    }
    return res.data;
});

export async function generateMetadata({ params }: ArtistPageParams): Promise<Metadata> {
    const { slug } = await params;
    const { artists, app } = await getI18n(headers);
    const data = await getInitialArtistCatalog(slug);

    if (!data) {
        return {
            title: artists.view.metaNotFoundTitle,
            description: artists.view.metaNotFoundDescription,
        };
    }

    return {
        title: `${data.artist.name} | ${app.title}`,
        description: data.artist.description || `${data.artist.name} - ${app.title}`,
    };
}

export default async function ArtistSongsPage({ params }: ArtistPageParams) {
    const { slug } = await params;
    const { artists } = await getI18n(headers);
    const data = await getInitialArtistCatalog(slug);

    if (!data) {
        notFound();
    }

    return (
        <div className="w-full create-repertoire-container">
            <ArtistSongsCatalogClient
                artist={data.artist}
                initialSongs={data.songs ?? []}
                initialCount={data.count ?? 0}
                totalArtistSongs={data.totalArtistSongs ?? 0}
                facets={
                    data.facets ?? {
                        genres: [],
                        keys: [],
                        postedByUsers: [],
                        albums: [],
                    }
                }
                i18n={artists.view}
            />
        </div>
    );
}
