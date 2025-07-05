export const extractBracedValues = (text: string): IBracedValue[] => {
    const lines = text.split('\n');
    const results: IBracedValue[] = [];

    lines.forEach((line, lineIndex) => {
        const regex = /\{(.*?)\}/g;
        let match;
        let lastIndex = 0;
        while ((match = regex.exec(line)) !== null) {
            const currentIndex = match.index;
            const position = currentIndex - lastIndex;
            results.push({
                value: match[1],
                line: lineIndex,
                position: position,
            });
            lastIndex = currentIndex;
        }
    });

    return results;
};

export interface IBracedValue {
    value: string;
    line: number;
    position: number;
}
