'use client';
import { ISongModel } from '@/infrastructure/models/SongModel';
import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';

import '../styles/pages/songs.sass';
import H1 from './headings/H1';
import { removeChords } from '../../utils/text-utils';

const SongText = ({
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
}: ISongModel) => {
    const [fontSize, setFontSize] = useState(16);
    const lyricsByLine = removeChords(lyrics)
        .split('\n')
        .map(e => ({ id: uuid(), value: e }));

    return (
        <div className='song-container'>
            <div className='song-title-container'>
                <H1>{title}</H1>
                <div className='song-info-layout'>
                    <p>Subido por: {postedBy}</p>
                    {forkOf ? <p>Versión de: {forkOf}</p> : null}
                    {artist ? <p>Compositor: {artist}</p> : null}
                </div>
            </div>
            <div className='song-info-layout'>
                {songKey && <p>Tonalidad: {songKey}</p>} {genre && <p> Ritmo: {genre}</p>}{' '}
                {bpm !== 0 && <p>Tempo: {bpm}</p>}
            </div>

            {sampleUri ? (
                <div className='sample-container'>Reproductor multimedia con el sample</div>
            ) : null}
            {lyricsByLine.map((e, i) => {
                return (
                    <React.Fragment key={e.id}>
                        <p>
                            {chords
                                .filter(x => x.line === i)
                                .map(c => (
                                    <button
                                        style={getPadding(c.position)}
                                        key={`${c.key}-${c.line}-${c.position}`}
                                        type='button'>
                                        <span className='song-chord-container'>{c.key}</span>
                                    </button>
                                ))}
                        </p>
                        <p>{e.value}</p>
                    </React.Fragment>
                );
            })}
            <br />
            {averageScore}
            <div className='song-tools'></div>
        </div>
    );
};

const getPadding = (position: number) => {
    const padding = position * 0.6;
    return { paddingLeft: `${padding}rem` };
};

export default SongText;
