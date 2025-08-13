'use client';
import { ISongModel } from '@/infrastructure/models/SongModel';
import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';

import '../../../styles/pages/songs.sass';
import H1 from '../../headings/H1';
import { removeChords, replaceTones } from '../../../../utils/text-utils';
import FloatingButtonMenu from '../../FloatingButtonMenu/FloatingButtonMenu';
import FloatingButtonItem from '../../FloatingButtonMenu/FloatingButtonItem';
import { useCounter } from '@mantine/hooks';
import { menuItems } from './menuConfig';

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
    const [fontSize, handlers] = useCounter(16, { min: 8, max: 20 });
    const [currentChords, setCurrentChords] = useState(chords);
    const [currentTone, setCurrentTone] = useState(0);

    const lyricsByLine = removeChords(lyrics)
        .split('\n')
        .map(e => ({ id: uuid(), value: e }));

    const changeTone = (ammount: number) => {
        const newChords = replaceTones(ammount, currentChords);
        setCurrentTone(currentTone + ammount);
        setCurrentChords(newChords);
    };

    //TODO: Add i18n
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
            <div className='song-lyrics-container' style={{ fontSize }}>
                {lyricsByLine.map((e, i) => {
                    return (
                        <div key={e.id}>
                            <p>
                                {currentChords
                                    .filter(x => x.line === i)
                                    .map(c => (
                                        <button
                                            style={getPadding(c.position)}
                                            key={`${uuid()}`}
                                            type='button'>
                                            <span className='song-chord-container'>{c.key}</span>
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
            <div className='song-tools'>
                {menuItems(handlers, changeTone).map(i => (
                    <FloatingButtonMenu
                        key={i.name}
                        buttonClassname='fbm-sm'
                        buttonLabel={<i.Label />}>
                        {i.children.map(c => (
                            <FloatingButtonItem icon={c.Label} key={c.name} onClick={c.onClick} />
                        ))}
                    </FloatingButtonMenu>
                ))}
            </div>
        </div>
    );
};

const getPadding = (position: number) => {
    const padding = position * 0.6;
    return { paddingLeft: `${padding}em` };
};

export default SongText;
