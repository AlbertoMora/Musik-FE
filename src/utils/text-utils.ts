import { IKey } from '@/infrastructure/models/SongModel';

export const extractBracedValues = (text: string): IBracedValue[] => {
    const lines = text.split('\n');
    const results: IBracedValue[] = [];

    lines.forEach((line, lineIndex) => {
        const regex = /\[(.*?)\]/g;
        let match;
        let lastIndex = 0;
        let lastMatchSize = 0;
        let lastMatchInnerSize = 0;
        while ((match = regex.exec(line)) !== null) {
            const position = match.index - lastIndex - lastMatchSize - lastMatchInnerSize;
            results.push({
                value: match[1],
                line: lineIndex,
                position,
            });
            lastIndex = match.index;
            lastMatchSize = match[1].length + 2;
            lastMatchInnerSize = match[1].length;
        }
    });

    return results;
};

// Lista de tonos base (usando sostenidos)
export const tones = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Conversión de bemoles a sostenidos equivalentes
const flatsToSharps: Record<string, string> = {
    Bb: 'A#',
    Db: 'C#',
    Eb: 'D#',
    Gb: 'F#',
    Ab: 'G#',
};

const getChordIndex = (chord: IKey) => {
    let chordKey = chord.key.trim();
    let chordOffset = 0;

    if (chordKey[1] === '#' || chordKey[1] === 'b') {
        chordKey = chordKey.substring(0, 2);
        chordOffset = 2;
    } else {
        chordKey = chordKey[0];
        chordOffset = 1;
    }

    if (flatsToSharps[chordKey]) {
        chordKey = flatsToSharps[chordKey];
    }

    const chordIndex = tones.findIndex(e => e === chordKey);

    return { chordIndex, chordOffset };
};

export const replaceTones = (ammount: number, chords: IKey[]) => {
    console.log(chords);
    const newChords = chords.map((e, i) => {
        const currentChordSize = e.key.length + 2;
        const { chordIndex: currentChordIndex, chordOffset } = getChordIndex(e) ?? {};
        const newIndex =
            (currentChordIndex + (ammount % tones.length) + tones.length) % tones.length;

        const newChord = tones[newIndex] + e.key.substring(chordOffset);
        const newChordSize = newChord.length + 2;
        if (chords[i + 1]?.line === e.line) {
            chords[i + 1].position += currentChordSize - newChordSize;
        }

        return { key: newChord, position: e.position, line: e.line };
    });
    return newChords;
};

export const removeChords = (lyrics: string) => {
    return lyrics.replace(/\[[^\]]*\]/g, '').trim();
};

export interface IBracedValue {
    value: string;
    line: number;
    position: number;
}
