'use client';
import React, { useEffect, useState } from 'react';
import '../../styles/components/mainPage/popular.sass';
import { IconFlame, IconMicrophone, IconMusic, IconStarFilled } from '@tabler/icons-react';
import Skeleton, { skeletonTypes } from '../aesthetics/Skeleton/Skeleton';
import { IArtistModel } from '@/domain/artists/artist-gateway';
import { getSongsByNameAction } from '@/infrastructure/adapters/songs/songs-actions';
import { getArtistsAction } from '@/infrastructure/adapters/artists/artists-actions';
import { ISongRes } from '@/domain/songs/song-gateway';
import { getSlugifiedValue } from '@/utils/text-utils';
import { useSetState } from '@mantine/hooks';
import { Text } from '@mantine/core';
import { I18nTypes } from '@/i18n/dictionaries';

interface IState {
    topArtists: [] | IArtistModel[];
    topSongs: [] | ISongRes[];
    bestRatedSongs: [] | ISongRes[];
}

interface ArtistSectionProps {
    i18n?: I18nTypes['main']['popular'];
}

const ArtistSection = ({ i18n }: ArtistSectionProps) => {
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
                    {i18n?.title || 'Lo más popular'}
                </Text>
            </h2>
            <hr />
            <div className='popular-container'>
                <div className='popular-top'>
                    <Text fw={600} size='lg'>
                        {i18n?.topSongs || 'Canciones más populares'}
                    </Text>
                    {isLoading ? (
                        <ArtistSkeleton />
                    ) : (
                        <SectionMapper type='lyric' data={tops.topSongs} byLabel={i18n?.by} />
                    )}
                </div>
                <div className='popular-top'>
                    <Text fw={600} size='lg'>
                        {i18n?.topArtists || 'Artistas más populares'}
                    </Text>
                    {isLoading ? (
                        <ArtistSkeleton />
                    ) : (
                        <SectionMapper type='artist' data={tops.topArtists} />
                    )}
                </div>
                <div className='popular-top'>
                    <Text fw={600} size='lg'>
                        {i18n?.bestRated || 'Las mejor calificadas'}
                    </Text>
                    {isLoading ? (
                        <ArtistSkeleton />
                    ) : (
                        <SectionMapper type='lyric' data={tops.bestRatedSongs} showRating byLabel={i18n?.by} />
                    )}
                </div>
            </div>
        </div>
    );
};

interface ISectionMapperProps {
    data: IArtistModel[] | ISongRes[];
    type: 'artist' | 'lyric';
    showRating?: boolean;
    byLabel?: string;
}

const SectionMapper = ({ data, type, showRating = false, byLabel = 'de' }: ISectionMapperProps) => {
    return (
        <>
            {data.map(e => {
                const songItem = type === 'lyric' ? (e as ISongRes) : null;
                const avgRate = songItem?.avg_rate ? Number(songItem.avg_rate) : 0;

                return (
                    <a
                        className='flex items-center justify-center gap-2.5 pl-2 w-full'
                        key={e.id}
                        href={`/${type}s/${
                            type === 'artist'
                                ? (e as IArtistModel).slug || getSlugifiedValue([e.name])
                                : (e as ISongRes).slug ||
                                  getSlugifiedValue([
                                      e.name,
                                      (e as ISongRes).artist_name,
                                      (e as ISongRes).posted_by,
                                  ])
                        }`}>
                        {type === 'lyric' ? <IconMusic size={15} /> : <IconMicrophone size={17} />}
                        <span className={type === 'artist' ? 'flex-1' : ''}>
                            {e.name}
                            {type === 'lyric' && ` ${byLabel} ${(e as ISongRes).artist_name}`}
                        </span>
                        {showRating && avgRate > 0 && (
                            <span
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 3,
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    color: '#f59e0b',
                                    marginLeft: 4,
                                }}>
                                <IconStarFilled size={12} style={{ color: '#f59e0b' }} />
                                {avgRate.toFixed(1)}
                            </span>
                        )}
                    </a>
                );
            })}
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
