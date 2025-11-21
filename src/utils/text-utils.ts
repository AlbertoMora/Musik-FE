import slugify from 'slugify';
import { IKey } from '@/infrastructure/models/SongModel';

export const extractBracedValues = (text: string): IBracedValue[] => {
    const lines = text.split('\n');
    const results: IBracedValue[] = [];

    for (const [lineIndex, line] of lines.entries()) {
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
    }

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

    const chordIndex = tones.indexOf(chordKey);

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
    return lyrics.replaceAll(/\[[^\]]*\]/g, '').trim();
};

export const getChordsFromText = (lyrics: string) => {
    return [...new Set(lyrics.matchAll(/\[[^\]]*\]/g).map(r => r[0]))];
};

export const insertAtIndex = (text: string, injection: string, index: number) => {
    if (index < 0 || index > text.length) return text;

    const preInjectionText = text.slice(0, index);
    const postInjectionText = text.slice(index);

    return `${preInjectionText}${injection}${postInjectionText}`;
};

export const getTemplateResult = <T extends Record<string, unknown>>(
    template: string,
    replacements: string[],
    data: T
) => {
    let text = template;

    for (const replacement in replacements) {
        text = text.replace('?', String(data[replacement]));
    }
    return text;
};

export const getLinkTemplateResult = <T extends Record<string, unknown>>(
    template: string,
    replacements: string[],

    data: T
) => {
    let text = template;
    for (const r of replacements) {
        const innerReplacements = r.split(',').map(re => String(data[re]));
        const textToReplace = getSlugifiedValue(innerReplacements);
        text = text.replace('?', textToReplace);
    }
    return text;
};

export const getSlugifiedValue = (props: string[]) => {
    let text = '';
    for (const [i, e] of props.entries()) {
        text += `${e}${i < props.length - 1 ? '-' : ''}`;
    }
    return slugify(text, {
        strict: true,
        trim: true,
        lower: true,
    });
};

export interface IBracedValue {
    value: string;
    line: number;
    position: number;
}
