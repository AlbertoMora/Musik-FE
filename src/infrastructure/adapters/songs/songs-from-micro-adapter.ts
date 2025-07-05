import { IKey, ISongModel } from '@/infrastructure/models/SongModel';
import { ISongGateway } from '../../../domain/songs/song-gateway';
import { extractBracedValues } from '@/utils/text-utils';

export class SongsFromMicroAdapter implements ISongGateway {
    public static readonly SONG_API_URI = process.env.SONG_MICRO_URI;

    public async getSongs() {
        return null;
    }

    public async getSong(id: string) {
        try {
            const data = await fetch(`${SongsFromMicroAdapter.SONG_API_URI}/v1/songs/${id}`);
            const song = await data.json();
            if (!data.ok || !song) {
                return null;
            }
            return this.wrapSongDTO(song as SongFromMicroDTO);
        } catch (e) {
            console.log(e);
            return null;
        }
    }

    public async postSong(song: Omit<SongFromMicroDTO, 'id' | 'posted_by'>) {
        try {
            const res = await fetch(`${SongsFromMicroAdapter.SONG_API_URI}/v1/songs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(song),
            });
            if (!res.ok) {
                console.error('Failed to post song:', res.statusText);
                return false;
            }
            return true;
        } catch (error) {
            console.error('Error posting song:', error);
            return false;
        }
    }

    public async getArtists(name: string) {
        try {
            const data = await fetch(
                `${SongsFromMicroAdapter.SONG_API_URI}/v1/artists?name=${encodeURIComponent(name)}`
            );
            const artists = await data.json();
            if (!data.ok || !artists) {
                return null;
            }
        } catch (error) {
            console.error('Error fetching artists:', error);
            return null;
        }
    }

    private wrapSongDTO(song: SongFromMicroDTO): ISongModel {
        const songModel: ISongModel = {
            postedBy: song.posted_by,
            averageScore: song.average_score ?? 0,
            artist: song.artist,
            forkOf: song.fork_of,
            id: song.id,
            chords: extractBracedValues(song.lyrics).map(
                key =>
                    ({
                        position: key.position,
                        key: key.value,
                        line: key.line,
                    } as IKey)
            ),
            lyrics: song.lyrics,
            title: song.name,
            genre: song.genre,
            sampleUri: song.sample_uri,
            bpm: song.bpm,
            songKey: song.key,
        };
        return songModel;
    }
}

export interface SongFromMicroDTO {
    posted_by: string;
    average_score?: number;
    artist: string;
    fork_of?: string;
    id: string;
    lyrics: string;
    name: string;
    genre: string;
    sample_uri?: string;
    bpm: number;
    key: string;
}
