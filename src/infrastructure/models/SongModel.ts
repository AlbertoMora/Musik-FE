export interface IKey {
    position: number;
    key: string;
    line: number;
}
export interface ISongModel {
    id: string;
    title: string;
    sampleUri?: string;
    averageScore: number;
    lyrics: string;
    genre: string;
    bpm: number;
    chords: IKey[];
    postedBy: string;
    forkOf?: string;
    artist: string;
    songKey: string;
}
