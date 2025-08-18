'use client';
import React, { useState } from 'react';

import '../../../styles/components/searchbar.sass';
import { IconMicrophone2, IconMusic, IconPencil, IconSearch } from '@tabler/icons-react';
import { useDebouncedCallback, useDebouncedValue } from '@mantine/hooks';
import { getSongsByNameAction } from '@/infrastructure/adapters/songs/songs-actions';
import { Loader, Text } from '@mantine/core';
import { AnimatedUnmountWrapper } from '../../animation/AnimationUnmountWrapper';
import { animations, animationSpeeds } from '@/constants/animation-constants';
import { ISongRes } from '@/domain/songs/song-gateway';
import { getLinkTemplateResult, getTemplateResult } from '@/utils/text-utils';
import { HasIdType } from '@/types/web-types';
import { getArtistsAction } from '@/infrastructure/adapters/artists/artists-actions';
import { IArtistModel } from '@/infrastructure/models/ArtistModel';
import { IUserResponseDTO } from '@/domain/users/users-gateway';
import { getUsers } from '@/infrastructure/adapters/users/users-actions';
import { I18nTypes } from '@/i18n/dictionaries';

const MusikSearchBar = ({ i18n }: { i18n: I18nTypes['main'] }) => {
    const [value, setValue] = useState('');
    const [debouncedValue] = useDebouncedValue(value, 250);
    const [currentSongs, setCurrentSongs] = useState<ISongRes[] | []>([]);
    const [currentArtist, setCurrentArtist] = useState<IArtistModel[] | []>([]);
    const [currentUsers, setCurrentUsers] = useState<IUserResponseDTO[] | []>([]);
    const [loadingState, setLoadingState] = useState(true);

    const debouncedSearch = useDebouncedCallback(async (value: string) => {
        setLoadingState(true);
        await fetchSongs(value);
        await fetchArtists(value);
        await fetchUsers(value);
        setLoadingState(false);
    }, 1000);

    const fetchArtists = async (value: string) => {
        if (value.length >= 3) {
            const res = await getArtistsAction(value, 2, 0);

            if (!res?.success && !res?.data) return setCurrentArtist([]);

            setCurrentArtist(res.data?.artists ?? []);
        } else {
            setCurrentArtist([]);
        }
    };
    const fetchUsers = async (value: string) => {
        if (value.length >= 3) {
            const res = await getUsers(value, 2, 0);

            if (!res?.success && !res?.data) return setCurrentUsers([]);

            setCurrentUsers(res.data?.users ?? []);
        } else {
            setCurrentUsers([]);
        }
    };

    const fetchSongs = async (value: string) => {
        if (value.length >= 3) {
            const res = await getSongsByNameAction(value, 3, 0);

            if (!res?.success && !res?.data) return setCurrentSongs([]);

            setCurrentSongs(res.data?.songs ?? []);
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
                placeholder={i18n.searchbar.label}
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
                <MusikBarResultsSection
                    label={i18n.searchbar.results.songs.title}
                    icon={<IconMusic size={15} />}
                    data={currentSongs}
                    linkTemplate={{ template: '/lyrics/?', replaceProperties: ['posted_by,name'] }}
                    textTemplate={{
                        template: `? ${i18n.searchbar.results.songs.templateReplacement} ?`,
                        replaceProperties: ['name', 'artist_name'],
                    }}
                    loadingState={loadingState}
                    not_found_label={i18n.searchbar.results.not_found}
                />
                <MusikBarResultsSection
                    label={i18n.searchbar.results.artists.title}
                    icon={<IconMicrophone2 size={15} />}
                    data={currentArtist}
                    linkTemplate={{ template: '/artists/?', replaceProperties: ['name'] }}
                    textTemplate={{
                        template: '?',
                        replaceProperties: ['name'],
                    }}
                    loadingState={loadingState}
                    not_found_label={i18n.searchbar.results.not_found}
                />
                <MusikBarResultsSection
                    label={i18n.searchbar.results.users.title}
                    icon={<IconPencil size={15} />}
                    data={currentUsers}
                    linkTemplate={{ template: '/editors/?', replaceProperties: ['username'] }}
                    textTemplate={{
                        template: '?',
                        replaceProperties: ['username'],
                    }}
                    loadingState={loadingState}
                    not_found_label={i18n.searchbar.results.not_found}
                />
            </AnimatedUnmountWrapper>
        </div>
    );
};
interface IMusikBarResultsSectionProps<T> {
    loadingState: boolean;
    linkTemplate: { replaceProperties: string[]; template: string };
    textTemplate: { replaceProperties: string[]; template: string };
    label: string;
    icon: React.ReactNode;
    data: T[];
    not_found_label: string;
}

const MusikBarResultsSection = <T extends HasIdType>({
    loadingState,
    linkTemplate,
    textTemplate,
    data,
    label,
    icon,
    not_found_label,
}: IMusikBarResultsSectionProps<T>) => {
    return (
        <div className='searchbar-results-section flex flex-col gap-2'>
            <Text className='searchbar-results-title' fw={500}>
                {label} {icon}
            </Text>
            <hr />
            {loadingState && <Loader className='self-center' />}
            {!loadingState && data.length === 0 && <p className='text-center'>{not_found_label}</p>}
            {!loadingState &&
                data.length !== 0 &&
                data.map(s => (
                    <div key={s.id} className='song-result-item text-center w-full'>
                        <a
                            className='w-full'
                            href={getLinkTemplateResult<T>(
                                linkTemplate.template,
                                linkTemplate.replaceProperties,
                                s
                            )}>
                            {getTemplateResult<T>(
                                textTemplate.template,
                                textTemplate.replaceProperties,
                                s
                            )}
                        </a>
                    </div>
                ))}
        </div>
    );
};

export default MusikSearchBar;
