'use client';
import { ISongModel } from '@/infrastructure/models/SongModel';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { v4 as uuid } from 'uuid';

import '../../../styles/pages/songs.sass';
import H1 from '../../headings/H1';
import { removeChords } from '../../../../utils/text-utils';
import { I18nTypes } from '@/i18n/dictionaries';
import MusicPlayer from '../MusicPlayer';
import SongTools from './SongTools';
import { createSongtextStore, StoreContext, ISongtextStore } from './songTextStore';
import UploadSampleForm from './UploadSampleForm';

interface ISongTextProps extends ISongModel {
    i18n: I18nTypes['lyrics']['text'];
}

const SongText = ({
    id,
    postedBy,
    averageScore,
    artist,
    forkOf,
    lyrics,
    title,
    genre,
    sampleUri,
    bpm,
    songKey,
    chords,
    permissions,
    i18n,
}: ISongTextProps) => {
    const useSongTextStore = useMemo(
        () => createSongtextStore(chords, id, permissions, sampleUri ?? ''),
        [chords, id, permissions, sampleUri],
    );

    const store = useSongTextStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState(0);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new ResizeObserver(entries => {
            setContainerHeight(entries[0].contentRect.height);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const ROW_HEIGHT_MULTIPLIER = 1.6 - store.fontSize * 0.005;
    const rowHeightPx = store.fontSize * ROW_HEIGHT_MULTIPLIER;
    const lineUnitsPerColumn =
        containerHeight > 0
            ? Math.max(1, Math.floor(containerHeight / rowHeightPx))
            : Math.max(1, store.paragraphSplit * 2);

    const lyricsByLine = removeChords(lyrics)
        .split('\n')
        .map((e, index) => ({ id: uuid(), value: e, lineIndex: index }));

    return (
        <StoreContext.Provider value={store}>
            <UploadSampleForm i18n={i18n} />

            <div className='song-container'>
                <SongInfo
                    {...{
                        id,
                        postedBy,
                        averageScore,
                        artist,
                        forkOf,
                        lyrics,
                        title,
                        genre,
                        sampleUri,
                        bpm,
                        songKey,
                        chords,
                        permissions,
                        i18n,
                    }}
                />
                <MusicPlayer i18n={i18n.musicPlayer} url={store.url} />
                <div className='song-lyrics-container' ref={containerRef}>
                    <div className='song-lyrics-inner' style={{ fontSize: store.fontSize }}>
                        {getLyricsSets(store, lyricsByLine, lineUnitsPerColumn)}
                    </div>
                </div>
                <br />
                {averageScore !== 0 && averageScore}
                <SongTools i18n={i18n.menuLabels} />
            </div>
        </StoreContext.Provider>
    );
};

const SongInfo = ({
    postedBy,
    artist,
    forkOf,
    title,
    genre,
    bpm,
    songKey,
    i18n,
}: ISongTextProps) => {
    return (
        <>
            <div className='song-title-container'>
                <H1>{title}</H1>
                <div className='song-info-layout'>
                    <p>
                        {i18n.labels.postedBy}: {postedBy}
                    </p>
                    {forkOf ? (
                        <p>
                            {i18n.labels.forkOf}: {forkOf}
                        </p>
                    ) : null}
                    {artist ? (
                        <p>
                            {i18n.labels.artist}: {artist}
                        </p>
                    ) : null}
                </div>
            </div>
            <div className='song-info-layout'>
                {songKey && (
                    <p>
                        {i18n.labels.key}: {songKey}
                    </p>
                )}{' '}
                {genre && (
                    <p>
                        {' '}
                        {i18n.labels.rythm}: {genre}
                    </p>
                )}{' '}
                {bpm !== 0 && (
                    <p>
                        {i18n.labels.bpm}: {bpm}
                    </p>
                )}
            </div>
        </>
    );
};

const getLyricsSets = (
    store: ISongtextStore,
    lyricsLines: LyricsProps[],
    lineUnitsPerColumn: number,
) => {
    const lyricSets = [];
    let currentLine = 0;
    let columnIndex = 0;
    while (currentLine < lyricsLines.length) {
        // Drop leading empty lines so each column always starts with content
        while (currentLine < lyricsLines.length && lyricsLines[currentLine].value.trim() === '') {
            currentLine++;
        }
        if (currentLine >= lyricsLines.length) break;

        let usedUnits = 0;
        const lines: LyricsProps[] = [];

        while (currentLine < lyricsLines.length) {
            const line = lyricsLines[currentLine];
            const hasChords = store.chords.some(chord => chord.line === line.lineIndex);
            const requiredUnits = hasChords ? 2 : 1;

            if (lines.length > 0 && usedUnits + requiredUnits > lineUnitsPerColumn) {
                break;
            }

            lines.push(line);
            usedUnits += requiredUnits;
            currentLine++;
        }

        lyricSets.push(<LyricsSet set={lines} store={store} key={`ls-${columnIndex}`} />);
        columnIndex++;
    }
    return lyricSets;
};

interface LyricsProps {
    id: string;
    value: string;
    lineIndex: number;
}

interface LyricLineProps extends LyricsProps {
    store: ISongtextStore;
}
const LyricLine = ({ id, value, store, lineIndex }: LyricLineProps) => {
    const lineChords = store.chords.filter(x => x.line === lineIndex);

    return (
        <div key={id}>
            {lineChords.length > 0 ? (
                <p>
                    {lineChords.map(c => (
                        <button style={getPadding(c.position)} key={`${uuid()}`} type='button'>
                            <span className='song-chord-container'>{c.key}</span>
                        </button>
                    ))}
                </p>
            ) : null}
            <p>{value || <br />}</p>
        </div>
    );
};

interface LyricsSetProps {
    set: LyricsProps[];
    store: ISongtextStore;
}

const LyricsSet = ({ set, store }: LyricsSetProps) => (
    <div>
        {set.map(e => (
            <LyricLine id={e.id} store={store} value={e.value} key={e.id} lineIndex={e.lineIndex} />
        ))}
    </div>
);

const getPadding = (position: number) => {
    const padding = position * 0.6;
    return { paddingLeft: `${padding}em` };
};

export default SongText;
