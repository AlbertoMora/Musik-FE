import { getI18n } from '@/i18n/dictionaries';
import { getSongAction } from '@/infrastructure/adapters/songs/songs-actions';
import { ISongModel } from '@/infrastructure/models/SongModel';
import SongText from '@/presentation/components/songs/SongText/SongText';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { cache } from 'react';

import '../../../presentation/styles/components/floating-button-menu.sass';

interface PageParams {
    params: Promise<{ id: string }>;
}

const defaultData: ISongModel = {
    id: '',
    title: '',
    sampleUri: '',
    averageScore: 0,
    lyrics: '',
    genre: '',
    bpm: 0,
    chords: [],
    postedBy: '',
    forkOf: '',
    artist: '',
    songKey: '',
    permissions: null,
};

const getSongData = cache(async (id: string): Promise<ISongModel> => {
    const res = await getSongAction(id);
    return res.data ?? defaultData;
});

export const generateMetadata = async ({ params }: PageParams): Promise<Metadata> => {
    const { id } = await params;

    const {
        lyrics: { text },
    } = await getI18n(headers);

    const songData = await getSongData(id);

    return {
        title: `${songData.title} ${text.labels.by} ${songData.artist} | Sonnetia`,
        description: songData.title,
    };
};

const SongPage = async ({ params }: PageParams) => {
    const { id } = await params;

    const {
        lyrics: { text },
    } = await getI18n(headers);

    const songData = await getSongData(id);

    return <SongText i18n={text} {...songData} />;
};

export default SongPage;
