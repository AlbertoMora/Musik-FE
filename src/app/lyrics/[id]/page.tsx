import { getI18n } from '@/i18n/dictionaries';
import { getSongAction } from '@/infrastructure/adapters/songs/songs-actions';
import { ISongModel } from '@/infrastructure/models/SongModel';
import SongText from '@/presentation/components/songs/SongText/SongText';
import { headers } from 'next/headers';

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

const SongPage = async ({ params }: PageParams) => {
    const { id } = await params;

    const {
        lyrics: { text },
    } = await getI18n(headers);

    const res = await getSongAction(id);
    const songData: ISongModel = res.data ?? defaultData;

    return (
        <>
            <head>
                <meta name='description' content={songData.title} />
                <title>{`${songData.title} ${text.labels.by} ${songData.artist} | Sonnetia`}</title>
            </head>
            <SongText i18n={text} {...songData} />
        </>
    );
};

export default SongPage;
