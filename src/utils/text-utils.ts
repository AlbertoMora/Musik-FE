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
export const removeChords = (lyrics: string) => {
    return lyrics.replace(/\[[^\]]*\]/g, '').trim();
};

export interface IBracedValue {
    value: string;
    line: number;
    position: number;
}
