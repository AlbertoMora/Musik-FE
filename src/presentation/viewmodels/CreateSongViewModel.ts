export interface ICreateSongViewModel {
    title: string;
    key: string;
    artist: string;
    forkOf?: string;
    genre: string;
    bpm: number;
    lyrics: string;
    sampleUri?: string;
}
