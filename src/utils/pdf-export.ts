'use client';

import { IKey } from '@/infrastructure/models/SongModel';
import { removeChords, tones } from './text-utils';

export interface ISongPdfExportPayload {
    title: string;
    artist?: string;
    postedBy?: string;
    forkOf?: string;
    genre?: string;
    bpm?: number;
    songKey?: string;
    toneVariation?: number;
    lyrics: string;
    chords: IKey[];
    labels?: {
        artist?: string;
        postedBy?: string;
        forkOf?: string;
        key?: string;
        rythm?: string;
        bpm?: string;
    };
}

export interface IRepertoirePdfExportPayload {
    repertoireName: string;
    songs: ISongPdfExportPayload[];
}

interface IPdfLineItem {
    value: string;
    lineIndex: number;
    chords: IKey[];
}

// US Letter in PDF points (72 points per inch): 8.5" x 11" = 612 x 792 pt
const LETTER_WIDTH_PT = 612;
const LETTER_HEIGHT_PT = 792;
const MARGIN_X_PT = 34;
const MARGIN_TOP_PT = 36;
const MARGIN_BOTTOM_PT = 32;
const HEADER_HEIGHT_PT = 64;
const COLUMN_GAP_PT = 24;

// Courier / Courier-Bold standard Type1 character width is exactly 0.6 * fontSize
const COURIER_CHAR_RATIO = 0.6;

const normalizeWinAnsiText = (input: string): string => {
    if (!input) return '';
    return input
        .replace(/[\u2018\u2019\u02BC]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        .replace(/[\u2013\u2014]/g, '-')
        .replace(/\u2026/g, '...')
        .replace(/\u266F/g, '#')
        .replace(/\u266D/g, 'b')
        .replace(/[^\x20-\x7E\xA0-\xFF]/g, '');
};

const escapePdfLiteral = (input: string): string => {
    const clean = normalizeWinAnsiText(input);
    let out = '';
    for (let i = 0; i < clean.length; i++) {
        const code = clean.charCodeAt(i);
        const ch = clean[i];
        if (ch === '\\' || ch === '(' || ch === ')') {
            out += `\\${ch}`;
        } else if (code >= 0x20 && code <= 0x7e) {
            out += ch;
        } else if (code >= 0xa0 && code <= 0xff) {
            out += `\\${code.toString(8).padStart(3, '0')}`;
        }
    }
    return out;
};

const computeTransposedSongKey = (baseKey?: string, toneVariation = 0): string => {
    if (!baseKey) return '';
    if (!toneVariation) return baseKey;

    const trimmed = baseKey.trim();
    const isMinor = trimmed.endsWith('m');
    const rootPart = isMinor ? trimmed.slice(0, -1) : trimmed;

    const flatsToSharps: Record<string, string> = {
        Bb: 'A#',
        Db: 'C#',
        Eb: 'D#',
        Gb: 'F#',
        Ab: 'G#',
    };
    const normalizedRoot = flatsToSharps[rootPart] ?? rootPart;
    const idx = tones.indexOf(normalizedRoot);
    if (idx === -1) return baseKey;

    const nextIdx = (idx + (toneVariation % tones.length) + tones.length) % tones.length;
    return `${tones[nextIdx]}${isMinor ? 'm' : ''}`;
};

const preparePdfLines = (lyrics: string, chords: IKey[]): IPdfLineItem[] => {
    const rawLines = removeChords(lyrics).split('\n');
    const items: IPdfLineItem[] = rawLines.map((value, lineIndex) => ({
        value: value.replace(/\t/g, '    '),
        lineIndex,
        chords: chords
            .filter(c => c.line === lineIndex)
            .sort((a, b) => a.position - b.position),
    }));

    // Trim trailing empty lines without chords
    while (
        items.length > 0 &&
        items[items.length - 1].value.trim() === '' &&
        items[items.length - 1].chords.length === 0
    ) {
        items.pop();
    }

    return items;
};

interface ILayoutTryResult {
    fitsInMaxTwoColumns: boolean;
    columns: IPdfLineItem[][];
    fontSize: number;
    chordFontSize: number;
    lyricRowHeight: number;
    chordRowHeight: number;
    emptyRowHeight: number;
}

const layoutColumnsForFontSize = (
    lines: IPdfLineItem[],
    fontSize: number,
    availableHeight: number,
    columnWidth: number,
): ILayoutTryResult => {
    const chordFontSize = Math.max(5.5, Number((fontSize * 0.86).toFixed(2)));
    const lyricRowHeight = fontSize * 1.24;
    const chordRowHeight = chordFontSize * 1.18;
    const emptyRowHeight = fontSize * 0.7;

    // Check if any line or chord position exceeds column width
    const charWidth = fontSize * COURIER_CHAR_RATIO;
    const maxCharsInColumn = Math.floor((columnWidth - 6) / charWidth);

    let maxLineCharsNeeded = 0;
    for (const ln of lines) {
        const lyricLen = ln.value.length;
        const maxChordEnd = ln.chords.reduce(
            (acc, c) => Math.max(acc, c.position + c.key.length + 1),
            0,
        );
        maxLineCharsNeeded = Math.max(maxLineCharsNeeded, lyricLen, maxChordEnd);
    }

    const columns: IPdfLineItem[][] = [];
    let idx = 0;

    while (idx < lines.length) {
        // Skip leading blank lines at the top of a column
        while (
            idx < lines.length &&
            lines[idx].value.trim() === '' &&
            lines[idx].chords.length === 0
        ) {
            idx++;
        }
        if (idx >= lines.length) break;

        const currentColumn: IPdfLineItem[] = [];
        let usedHeight = 0;

        while (idx < lines.length) {
            const item = lines[idx];
            const isBlank = item.value.trim() === '' && item.chords.length === 0;
            const blockHeight = isBlank
                ? emptyRowHeight
                : (item.chords.length > 0 ? chordRowHeight : 0) + lyricRowHeight + fontSize * 0.12;

            if (currentColumn.length > 0 && usedHeight + blockHeight > availableHeight) {
                break;
            }

            currentColumn.push(item);
            usedHeight += blockHeight;
            idx++;
        }

        columns.push(currentColumn);
    }

    const fitsVertically = columns.length <= 2;
    const fitsHorizontally = maxLineCharsNeeded <= maxCharsInColumn;

    return {
        fitsInMaxTwoColumns: fitsVertically && fitsHorizontally,
        columns: columns.slice(0, 2),
        fontSize,
        chordFontSize,
        lyricRowHeight,
        chordRowHeight,
        emptyRowHeight,
    };
};

const findOptimalLetterLayout = (lines: IPdfLineItem[]) => {
    const usableWidth = LETTER_WIDTH_PT - MARGIN_X_PT * 2;
    const singleColumnWidth = usableWidth;
    const twoColumnWidth = (usableWidth - COLUMN_GAP_PT) / 2;
    const usableHeight = LETTER_HEIGHT_PT - MARGIN_TOP_PT - MARGIN_BOTTOM_PT - HEADER_HEIGHT_PT;

    // Candidate font sizes from 11.5pt down to 5.0pt in 0.25pt steps
    for (let size = 11.5; size >= 5.0; size = Number((size - 0.25).toFixed(2))) {
        const attempt = layoutColumnsForFontSize(lines, size, usableHeight, twoColumnWidth);
        if (attempt.fitsInMaxTwoColumns) {
            return {
                ...attempt,
                usableWidth,
                usableHeight,
                columnWidth: attempt.columns.length === 1 ? singleColumnWidth : twoColumnWidth,
            };
        }
    }

    // If the song is extraordinarily long, pick the smallest readable font size and pack into 2 columns
    const fallback = layoutColumnsForFontSize(lines, 5.0, usableHeight, twoColumnWidth);
    return {
        ...fallback,
        usableWidth,
        usableHeight,
        columnWidth: twoColumnWidth,
    };
};

const buildMultiPagePdfBytes = (pageStreams: string[]): Uint8Array => {
    const encoder = new TextEncoder();
    const safeStreams = pageStreams.length > 0 ? pageStreams : [''];

    // Fixed object IDs:
    // 1: Catalog
    // 2: Pages
    // 3: Font F1 (Courier)
    // 4: Font F2 (Courier-Bold)
    // 5: Font F3 (Helvetica-Bold)
    // 6: Font F4 (Helvetica)
    // For each page i (0..N-1):
    //   pageObjId = 7 + i * 2
    //   contentObjId = 8 + i * 2
    const pageObjIds = safeStreams.map((_, idx) => 7 + idx * 2);
    const kidsRefString = pageObjIds.map(id => `${id} 0 R`).join(' ');

    const objects: string[] = [
        `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`,
        `2 0 obj\n<< /Type /Pages /Kids [${kidsRefString}] /Count ${safeStreams.length} >>\nendobj\n`,
        `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>\nendobj\n`,
        `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>\nendobj\n`,
        `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n`,
        `6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n`,
    ];

    safeStreams.forEach((streamContent, idx) => {
        const pageObjId = 7 + idx * 2;
        const contentObjId = 8 + idx * 2;
        const streamBytes = encoder.encode(streamContent);

        objects.push(
            `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${LETTER_WIDTH_PT} ${LETTER_HEIGHT_PT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R /F4 6 0 R >> >> /Contents ${contentObjId} 0 R >>\nendobj\n`,
        );
        objects.push(
            `${contentObjId} 0 obj\n<< /Length ${streamBytes.byteLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
        );
    });

    let pdfText = '%PDF-1.4\n';
    const offsets: number[] = [0];

    for (const obj of objects) {
        offsets.push(encoder.encode(pdfText).byteLength);
        pdfText += obj;
    }

    const xrefOffset = encoder.encode(pdfText).byteLength;
    pdfText += `xref\n0 ${objects.length + 1}\n`;
    pdfText += `0000000000 65535 f \n`;
    for (let i = 1; i <= objects.length; i++) {
        pdfText += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
    }

    pdfText += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return encoder.encode(pdfText);
};

interface IPageFooterMeta {
    repertoireName?: string;
    pageNumber?: number;
    totalPages?: number;
}

const buildSongPageContentStream = (
    payload: ISongPdfExportPayload,
    footerMeta?: IPageFooterMeta,
): string => {
    const lines = preparePdfLines(payload.lyrics, payload.chords);
    const layout = findOptimalLetterLayout(lines);

    const ops: string[] = [];

    // 1. Header Banner & Title (US Letter Top)
    const topY = LETTER_HEIGHT_PT - MARGIN_TOP_PT;

    // Accent bar on left of header
    ops.push(`0.467 0.204 0.776 rg`); // #7734c6 Sonnetia purple
    ops.push(`${MARGIN_X_PT} ${topY - 38} 4 38 re f`);

    // Song Title
    const titleX = MARGIN_X_PT + 12;
    const prefixIndex =
        footerMeta?.pageNumber && footerMeta?.totalPages && footerMeta.totalPages > 1
            ? `${footerMeta.pageNumber}. `
            : '';
    const safeTitle = escapePdfLiteral(`${prefixIndex}${payload.title || 'Cancion'}`);
    ops.push(`0.09 0.09 0.14 rg`);
    ops.push(`BT /F3 18 Tf ${titleX} ${topY - 16} Td (${safeTitle}) Tj ET`);

    // Subtitle: Repertoire (if present), Artist / PostedBy / ForkOf
    const subtitleParts: string[] = [];
    if (footerMeta?.repertoireName) {
        subtitleParts.push(footerMeta.repertoireName);
    }
    if (payload.artist) {
        subtitleParts.push(`${payload.labels?.artist || 'Artista'}: ${payload.artist}`);
    }
    if (payload.postedBy) {
        subtitleParts.push(`${payload.labels?.postedBy || 'Publicado por'}: ${payload.postedBy}`);
    }
    if (payload.forkOf) {
        subtitleParts.push(`${payload.labels?.forkOf || 'A partir de'}: ${payload.forkOf}`);
    }
    const subtitleText = escapePdfLiteral(subtitleParts.join('   |   '));
    if (subtitleText) {
        ops.push(`0.35 0.37 0.45 rg`);
        ops.push(`BT /F4 9.5 Tf ${titleX} ${topY - 32} Td (${subtitleText}) Tj ET`);
    }

    // Right-side Metadata Pills (Key, Genre, BPM)
    const effectiveKey = computeTransposedSongKey(payload.songKey, payload.toneVariation);
    const metaRightParts: string[] = [];
    if (effectiveKey) {
        metaRightParts.push(`${payload.labels?.key || 'Tono'}: ${effectiveKey}`);
    }
    if (payload.genre) {
        metaRightParts.push(`${payload.labels?.rythm || 'Ritmo'}: ${payload.genre}`);
    }
    if (payload.bpm && payload.bpm !== 0) {
        metaRightParts.push(`${payload.labels?.bpm || 'BPM'}: ${payload.bpm}`);
    }
    const metaRightStr = normalizeWinAnsiText(metaRightParts.join('  •  '));
    if (metaRightStr) {
        const approxWidth = metaRightStr.length * 5.2 + 16;
        const badgeX = LETTER_WIDTH_PT - MARGIN_X_PT - approxWidth;
        const badgeY = topY - 26;
        ops.push(`0.95 0.93 0.99 rg`);
        ops.push(`${badgeX.toFixed(2)} ${badgeY.toFixed(2)} ${approxWidth.toFixed(2)} 18 re f`);
        ops.push(`0.467 0.204 0.776 rg`);
        ops.push(
            `BT /F3 9 Tf ${(badgeX + 8).toFixed(2)} ${(badgeY + 5.5).toFixed(2)} Td (${escapePdfLiteral(metaRightStr)}) Tj ET`,
        );
    }

    // Header separator line
    const dividerY = topY - HEADER_HEIGHT_PT + 14;
    ops.push(`0.84 0.85 0.90 RG`);
    ops.push(`0.75 w`);
    ops.push(`${MARGIN_X_PT} ${dividerY} m ${LETTER_WIDTH_PT - MARGIN_X_PT} ${dividerY} l S`);

    // If 2 columns, draw a subtle vertical column divider
    if (layout.columns.length === 2) {
        const midX = LETTER_WIDTH_PT / 2;
        ops.push(`0.90 0.91 0.94 RG`);
        ops.push(`0.5 w`);
        ops.push(
            `${midX.toFixed(2)} ${MARGIN_BOTTOM_PT + 12} m ${midX.toFixed(2)} ${dividerY - 8} l S`,
        );
    }

    // 2. Render Columns (max 2 columns) with chords directly above the exact syllable
    const contentTopY = dividerY - 12;
    const charWidthPt = layout.fontSize * COURIER_CHAR_RATIO;

    layout.columns.forEach((columnLines, colIdx) => {
        const colStartX = MARGIN_X_PT + colIdx * (layout.columnWidth + COLUMN_GAP_PT);
        let cursorY = contentTopY;

        for (const line of columnLines) {
            const isBlank = line.value.trim() === '' && line.chords.length === 0;
            if (isBlank) {
                cursorY -= layout.emptyRowHeight;
                continue;
            }

            // Render chords row if this line has chords
            if (line.chords.length > 0) {
                cursorY -= layout.chordRowHeight;

                // Prevent overlapping chords if two chords are placed very close together
                let minNextX = colStartX;
                for (const chord of line.chords) {
                    const idealX = colStartX + chord.position * charWidthPt;
                    const chordX = Math.max(minNextX, idealX);
                    const chordLabel = escapePdfLiteral(chord.key);

                    // Draw subtle pill background behind each chord for clarity
                    const pillW = Math.max(
                        chord.key.length * (layout.chordFontSize * COURIER_CHAR_RATIO) + 4,
                        layout.chordFontSize * 1.15,
                    );
                    const pillH = layout.chordFontSize * 1.12;
                    ops.push(`0.94 0.90 0.99 rg`);
                    ops.push(
                        `${(chordX - 2).toFixed(2)} ${(cursorY - layout.chordFontSize * 0.18).toFixed(2)} ${pillW.toFixed(2)} ${pillH.toFixed(2)} re f`,
                    );

                    // Draw chord text in Sonnetia purple using Courier-Bold
                    ops.push(`0.42 0.14 0.74 rg`);
                    ops.push(
                        `BT /F2 ${layout.chordFontSize.toFixed(2)} Tf ${chordX.toFixed(2)} ${cursorY.toFixed(2)} Td (${chordLabel}) Tj ET`,
                    );

                    minNextX = chordX + pillW + 2;
                }
            }

            // Render lyric line in Courier right below its chords
            cursorY -= layout.lyricRowHeight;
            if (line.value.trim().length > 0) {
                ops.push(`0.10 0.11 0.15 rg`);
                ops.push(
                    `BT /F1 ${layout.fontSize.toFixed(2)} Tf ${colStartX.toFixed(2)} ${cursorY.toFixed(2)} Td (${escapePdfLiteral(line.value)}) Tj ET`,
                );
            }

            cursorY -= layout.fontSize * 0.12;
        }
    });

    // 3. Footer
    const footerY = MARGIN_BOTTOM_PT - 10;
    ops.push(`0.55 0.57 0.65 rg`);
    const leftFooter = footerMeta?.repertoireName
        ? `Sonnetia  •  Repertorio: ${footerMeta.repertoireName}`
        : `Sonnetia  •  Exportado en formato Carta`;
    ops.push(`BT /F4 8 Tf ${MARGIN_X_PT} ${footerY} Td (${escapePdfLiteral(leftFooter)}) Tj ET`);

    if (footerMeta?.pageNumber && footerMeta?.totalPages) {
        const pageStr = `${footerMeta.pageNumber} / ${footerMeta.totalPages}`;
        const rightX = LETTER_WIDTH_PT - MARGIN_X_PT - pageStr.length * 4.5;
        ops.push(
            `BT /F3 8.5 Tf ${rightX.toFixed(2)} ${footerY} Td (${escapePdfLiteral(pageStr)}) Tj ET`,
        );
    }

    return ops.join('\n');
};

const triggerPdfDownload = (pdfBytes: Uint8Array, rawName: string, fallbackName: string) => {
    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const safeFileName =
        (rawName || fallbackName)
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || fallbackName;

    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeFileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
};

export const exportSongToLetterPdf = (payload: ISongPdfExportPayload) => {
    if (typeof window === 'undefined') return;

    const pageStream = buildSongPageContentStream(payload);
    const pdfBytes = buildMultiPagePdfBytes([pageStream]);
    triggerPdfDownload(pdfBytes, payload.title, 'cancion');
};

export const exportRepertoireToLetterPdf = (payload: IRepertoirePdfExportPayload) => {
    if (typeof window === 'undefined' || !payload.songs.length) return;

    const totalPages = payload.songs.length;
    const pageStreams = payload.songs.map((song, idx) =>
        buildSongPageContentStream(song, {
            repertoireName: payload.repertoireName,
            pageNumber: idx + 1,
            totalPages,
        }),
    );

    const pdfBytes = buildMultiPagePdfBytes(pageStreams);
    triggerPdfDownload(pdfBytes, payload.repertoireName, 'repertorio');
};
