'use client';
import React, { useEffect, useState } from 'react';
import '../../styles/components/mainPage/popular.sass';
import { IconFlame } from '@tabler/icons-react';
import Skeleton, { skeletonTypes } from '../aesthetics/Skeleton/Skeleton';

const ArtistSection = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [tops, setTops] = useState({ topArtists: [], topSongs: [] });
    useEffect(() => {
        const loadData = async () => {};
    }, []);

    return (
        <div className='popular'>
            <h2 className='flex items-center justify-center w-full'>
                <IconFlame /> Lo más popular
            </h2>
            <hr />
            <div className='popular-container'>
                <div className='popular-songs'>
                    <h3>Canciones más populares</h3>
                    <ArtistSkeleton />
                </div>
                <div className='popular-artist'>
                    <h3>Artistas más populares</h3>
                    <ArtistSkeleton />
                </div>
            </div>
        </div>
    );
};

const ArtistSkeleton = () => {
    return (
        <div className='flex flex-col gap-y-1.5'>
            <Skeleton type={skeletonTypes.text} />
            <Skeleton type={skeletonTypes.text} />
            <Skeleton type={skeletonTypes.text} />
            <Skeleton type={skeletonTypes.text} />
            <Skeleton type={skeletonTypes.text} />
        </div>
    );
};

export default ArtistSection;
