import { getSongAction } from '@/infrastructure/adapters/songs/songs-actions';
import { ISongModel } from '@/infrastructure/models/SongModel';
import SongText from '@/presentation/components/SongText';

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
};

const SongPage = async ({ params }: PageParams) => {
    const { id } = await params;

    const res = await getSongAction(id);
    const songData: ISongModel = res.data ?? defaultData;

    return <SongText {...songData} />;
};

export default SongPage;
