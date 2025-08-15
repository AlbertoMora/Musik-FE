'use client';
import React, { useState } from 'react';

import '../../../styles/components/searchbar.sass';
import { IconSearch } from '@tabler/icons-react';
import { useDebouncedCallback, useDebouncedValue } from '@mantine/hooks';
import { getSongsByNameAction } from '@/infrastructure/adapters/songs/songs-actions';
import { Loader, Text } from '@mantine/core';
import { AnimatedUnmountWrapper } from '../../animation/AnimationUnmountWrapper';
import { animations, animationSpeeds } from '@/constants/animation-constants';

const loadingStateInitialValues = {
    songsLoadingState: true,
    artistsLoadingState: false,
    usersLoadingState: false,
};
const MusikSearchBar = () => {
    const [value, setValue] = useState('');
    const [debouncedValue] = useDebouncedValue(value, 250);
    const [currentSongs, setCurrentSongs] = useState([]);
    const [loadingState, setLoadingState] = useState(loadingStateInitialValues);

    const debouncedSearch = useDebouncedCallback((value: string) => {
        fetchSongs(value);
    }, 1000);

    const fetchSongs = async (value: string) => {
        if (value.length >= 3) {
            setLoadingState({ ...loadingState, songsLoadingState: true });
            const res = await getSongsByNameAction(value);
            setLoadingState({ ...loadingState, songsLoadingState: false });

            if (!res?.success && !res?.data) return setCurrentSongs([]);

            setCurrentSongs(res.data);
        } else {
            setCurrentSongs([]);
        }
    };

    const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        debouncedSearch(e.target.value);
    };
    return (
        <div className='searchbar-container searchbar-xl'>
            <input
                value={value}
                onChange={onChangeHandler}
                placeholder='Busca una canción, artista o usuario'
                type='text'
                className='searchbar-input'
            />
            <IconSearch className='searchbar-icon' />

            <AnimatedUnmountWrapper
                show={debouncedValue.length >= 3}
                customClass='searchbar-results'
                enter={animations.entrances.fadeInUp}
                exit={animations.exits.fadeOutDown}
                duration={animationSpeeds.fastest}>
                <div className='searchbar-results-section flex flex-col gap-2'>
                    <Text size='lg' fw={500}>
                        Canciones
                    </Text>
                    <hr />
                    {loadingState.songsLoadingState && <Loader className='self-center' />}
                    {!loadingState.songsLoadingState && currentSongs.length === 0 && (
                        <p className='text-center'>No se han encontrado resultados</p>
                    )}
                </div>
                <div className='searchbar-results-section flex flex-col gap-2'>
                    <Text size='lg' fw={500}>
                        Artistas
                    </Text>
                    <hr />
                    {loadingState.songsLoadingState && <Loader className='self-center' />}
                    {!loadingState.songsLoadingState && currentSongs.length === 0 && (
                        <p className='text-center'>No se han encontrado resultados</p>
                    )}
                </div>
                <div className='searchbar-results-section flex flex-col gap-2'>
                    <Text size='lg' fw={500}>
                        Usuarios
                    </Text>
                    <hr />
                    {loadingState.songsLoadingState && <Loader className='self-center' />}
                    {!loadingState.songsLoadingState && currentSongs.length === 0 && (
                        <p className='text-center'>No se han encontrado resultados</p>
                    )}
                </div>
            </AnimatedUnmountWrapper>
        </div>
    );
};

export default MusikSearchBar;
