import { SongsFromMicroAdapter } from '@/infrastructure/adapters/songs/songs-from-micro-adapter';
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

    const songData: ISongModel = await (async () => {
        if (!id) {
            return defaultData;
        }

        const songAdapter = new SongsFromMicroAdapter();

        const song = await songAdapter.getSong(id);
        if (!song) {
            return defaultData;
        }
        return song;
    })();

    return (
        <div>
            <SongText {...songData} />
        </div>
    );
};

export default SongPage;
