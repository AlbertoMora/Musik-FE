import { getI18n } from '@/i18n/dictionaries';
import { getSongAction } from '@/infrastructure/adapters/songs/songs-actions';
import { ISongModel } from '@/infrastructure/models/SongModel';
import SongNotFound from '@/presentation/components/songs/SongNotFound';
import SongText from '@/presentation/components/songs/SongText/SongText';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { cache } from 'react';

import '../../../presentation/styles/components/floating-button-menu.sass';

interface PageParams {
    params: Promise<{ id: string }>;
}

const getSongData = cache(async (id: string): Promise<ISongModel | null> => {
    const res = await getSongAction(id);
    if (!res.success || !res.data || !res.data.id) {
        return null;
    }
    return res.data;
});

export const generateMetadata = async ({ params }: PageParams): Promise<Metadata> => {
    const { id } = await params;

    const {
        lyrics: { text, notFound },
    } = await getI18n(headers);

    const songData = await getSongData(id);

    if (!songData) {
        return {
            title: notFound.metaTitle,
            description: notFound.metaDescription,
        };
    }

    return {
        title: `${songData.title} ${text.labels.by} ${songData.artist} | Sonnetia`,
        description: songData.title,
    };
};

const SongPage = async ({ params }: PageParams) => {
    const { id } = await params;

    const {
        lyrics: { text, notFound },
    } = await getI18n(headers);

    const songData = await getSongData(id);

    if (!songData) {
        return <SongNotFound i18n={notFound} />;
    }

    return <SongText i18n={text} {...songData} />;
};

export default SongPage;
