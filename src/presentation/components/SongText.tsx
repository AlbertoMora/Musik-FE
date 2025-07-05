'use client';
import { ISongModel } from '@/infrastructure/models/SongModel';
import React from 'react';
import { v4 as uuid } from 'uuid';

import '../styles/pages/songs.sass';
import H1 from './headings/H1';
import { Badge } from '@mantine/core';
import { extractBracedValues } from '@/utils/text-utils';

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
}: ISongModel) => {
    const lyricsByLine = lyrics.split('%%').map(e => ({ id: uuid(), value: e }));

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
                <p>Tonalidad: {songKey}</p> <p>Ritmo: {genre}</p> <p>Tempo: {bpm}</p>
            </div>

            {sampleUri ? (
                <div className='sample-container'>Reproductor multimedia con el sample</div>
            ) : null}
            {lyricsByLine.map((e, i) => {
                return (
                    <React.Fragment key={e.id}>
                        <p>
                            {extractBracedValues(lyrics)
                                .filter(x => x.line === i)
                                .map(c => (
                                    <button style={getPadding(c.position)} key={c.value}>
                                        <Badge>{c.value}</Badge>
                                    </button>
                                ))}
                        </p>
                        <p>{e.value}</p>
                    </React.Fragment>
                );
            })}
            <br />
            {averageScore}
        </div>
    );
};

const getPadding = (padding: number) => {
    const finalPadding = padding - 2;
    return { paddingLeft: `${finalPadding}rem` };
};

export default SongText;
