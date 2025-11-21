'use client';
import { ISongModel } from '@/infrastructure/models/SongModel';
import React, { useMemo } from 'react';
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
        [chords, id, permissions, sampleUri]
    );

    const store = useSongTextStore();

    const lyricsByLine = removeChords(lyrics)
        .split('\n')
        .map(e => ({ id: uuid(), value: e }));

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
                <div className='song-lyrics-container' style={{ fontSize: store.fontSize }}>
                    {getLyricsSets(store, lyricsByLine)}
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

const getLyricsSets = (store: ISongtextStore, lyricsLines: LyricsProps[]) => {
    const lineSlices = Math.trunc(lyricsLines.length / store.paragraphSplit);
    const lyricSets = [];
    for (let i = 0; i <= lineSlices; i++) {
        const lines = lyricsLines.slice(i * store.paragraphSplit, store.paragraphSplit * (i + 1));
        lyricSets.push(<LyricsSet set={lines} store={store} lineSlice={i} key={`ls-${i}`} />);
    }
    return lyricSets;
};

interface LyricsProps {
    id: string;
    value: string;
}

interface LyricLineProps extends LyricsProps {
    i: number;
    store: ISongtextStore;
    lineSlice: number;
}
const LyricLine = ({ id, value, i, store, lineSlice }: LyricLineProps) => (
    <div key={id}>
        <p>
            {store.chords
                .filter(x => x.line === i + lineSlice * store.paragraphSplit)
                .map(c => (
                    <button style={getPadding(c.position)} key={`${uuid()}`} type='button'>
                        <span className='song-chord-container'>{c.key}</span>
                    </button>
                ))}
        </p>
        <p>
            {value || (
                <>
                    <br />
                    <br />
                </>
            )}
        </p>
    </div>
);

interface LyricsSetProps {
    set: LyricsProps[];
    store: ISongtextStore;
    lineSlice: number;
}

const LyricsSet = ({ set, store, lineSlice }: LyricsSetProps) => (
    <div>
        {set.map((e, i) => (
            <LyricLine
                id={e.id}
                i={i}
                store={store}
                value={e.value}
                key={e.id}
                lineSlice={lineSlice}
            />
        ))}
    </div>
);

const getPadding = (position: number) => {
    const padding = position * 0.6;
    return { paddingLeft: `${padding}em` };
};

export default SongText;
