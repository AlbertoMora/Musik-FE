'use client';
import React, { useEffect, useState } from 'react';
import '../../styles/components/mainPage/popular.sass';
import { IconFlame, IconMicrophone, IconMusic } from '@tabler/icons-react';
import Skeleton, { skeletonTypes } from '../aesthetics/Skeleton/Skeleton';
import { IArtistModel } from '@/domain/artists/artist-gateway';
import { getSongsByNameAction } from '@/infrastructure/adapters/songs/songs-actions';
import { getArtistsAction } from '@/infrastructure/adapters/artists/artists-actions';
import { ISongRes } from '@/domain/songs/song-gateway';
import { getSlugifiedValue } from '@/utils/text-utils';
import { useSetState } from '@mantine/hooks';
import { Text } from '@mantine/core';

interface IState {
    topArtists: [] | IArtistModel[];
    topSongs: [] | ISongRes[];
    bestRatedSongs: [] | ISongRes[];
}

const ArtistSection = () => {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [tops, setTops] = useSetState<IState>({
        topArtists: [],
        topSongs: [],
        bestRatedSongs: [],
    });
    useEffect(() => {
        const loadData = async () => {
            const bestRatedSongsResponse = await getSongsByNameAction('', 5, 0);

            if (bestRatedSongsResponse.success && bestRatedSongsResponse.data) {
                setTops({ bestRatedSongs: bestRatedSongsResponse.data.songs });
            } else {
                setTops({ bestRatedSongs: [] });
            }

            const topArtistsResponse = await getArtistsAction('', 5, 0);

            if (topArtistsResponse.success && topArtistsResponse.data) {
                setTops({ topArtists: topArtistsResponse.data.artists });
            } else {
                setTops({ topArtists: [] });
            }

            const topSongsResponse = await getSongsByNameAction('', 5, 0, 'top');
            if (topSongsResponse.success && topSongsResponse.data) {
                setTops({ topSongs: topSongsResponse.data.songs });
            } else {
                setTops({ topSongs: [] });
            }

            setIsLoading(false);
        };

        loadData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className='popular'>
            <h2 className='flex items-center justify-center w-full'>
                <IconFlame size={25} />{' '}
                <Text fw={600} size='xl'>
                    Lo más popular
                </Text>
            </h2>
            <hr />
            <div className='popular-container'>
                <div className='popular-top'>
                    <Text fw={600} size='lg'>
                        Canciones más populares
                    </Text>
                    {isLoading ? (
                        <ArtistSkeleton />
                    ) : (
                        <SectionMapper type='lyric' data={tops.topSongs} />
                    )}
                </div>
                <div className='popular-top'>
                    <Text fw={600} size='lg'>
                        Artistas más populares
                    </Text>
                    {isLoading ? (
                        <ArtistSkeleton />
                    ) : (
                        <SectionMapper type='artist' data={tops.topArtists} />
                    )}
                </div>
                <div className='popular-top'>
                    <Text fw={600} size='lg'>
                        Las mejor calificadas
                    </Text>
                    {isLoading ? (
                        <ArtistSkeleton />
                    ) : (
                        <SectionMapper type='lyric' data={tops.bestRatedSongs} />
                    )}
                </div>
            </div>
        </div>
    );
};

interface ISectionMapperProps {
    data: IArtistModel[] | ISongRes[];
    type: 'artist' | 'lyric';
}

const SectionMapper = ({ data, type }: ISectionMapperProps) => {
    return (
        <>
            {data.map(e => (
                <a
                    className='flex items-center justify-center gap-2.5 pl-2 w-full'
                    key={e.id}
                    href={`/${type}s/${
                        type === 'artist'
                            ? getSlugifiedValue([e.name])
                            : getSlugifiedValue([e.name, e.posted_by])
                    }`}>
                    {type === 'lyric' ? <IconMusic size={15} /> : <IconMicrophone size={17} />}
                    <span className={type === 'artist' ? 'flex-1' : ''}>
                        {e.name}
                        {type === 'lyric' && ` de ${(e as ISongRes).artist_name}`}
                    </span>
                </a>
            ))}
        </>
    );
};

const ArtistSkeleton = () => {
    return (
        <div className='flex flex-col gap-y-1.5 items-stretch justify-stretch w-full'>
            <Skeleton type={skeletonTypes.text} />
            <Skeleton type={skeletonTypes.text} />
            <Skeleton type={skeletonTypes.text} />
            <Skeleton type={skeletonTypes.text} />
            <Skeleton type={skeletonTypes.text} />
        </div>
    );
};

export default ArtistSection;
