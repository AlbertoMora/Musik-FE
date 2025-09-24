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
import { createSongtextStore, StoreContext } from './songTextStore';

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
    i18n,
}: ISongTextProps) => {
    const useSongTextStore = useMemo(() => createSongtextStore(chords, id), [chords, id]);
    const store = useSongTextStore();

    const lyricsByLine = removeChords(lyrics)
        .split('\n')
        .map(e => ({ id: uuid(), value: e }));

    return (
        <StoreContext.Provider value={store}>
            <div className='song-container'>
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

                <MusicPlayer i18n={i18n.musicPlayer} url={sampleUri} />
                <div className='song-lyrics-container' style={{ fontSize: store.fontSize }}>
                    {lyricsByLine.map((e, i) => {
                        return (
                            <div key={e.id}>
                                <p>
                                    {store.chords
                                        .filter(x => x.line === i)
                                        .map(c => (
                                            <button
                                                style={getPadding(c.position)}
                                                key={`${uuid()}`}
                                                type='button'>
                                                <span className='song-chord-container'>
                                                    {c.key}
                                                </span>
                                            </button>
                                        ))}
                                </p>
                                <p>{e.value}</p>
                            </div>
                        );
                    })}
                </div>
                <br />
                {averageScore !== 0 && averageScore}
                <SongTools i18n={i18n.menuLabels} />
            </div>
        </StoreContext.Provider>
    );
};

const getPadding = (position: number) => {
    const padding = position * 0.6;
    return { paddingLeft: `${padding}em` };
};

export default SongText;
