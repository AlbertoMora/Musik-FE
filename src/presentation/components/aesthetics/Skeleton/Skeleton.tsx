import React from 'react';

import '../../../styles/components/aesthetics/skeleton.sass';

interface ISkeletonProps {
    type: skeletonTypes;
}

const Skeleton = ({ type }: ISkeletonProps) => {
    return (
        <div className='card'>
            <div className={`skeleton skeleton-${type}`}></div>
        </div>
    );
};

export enum skeletonTypes {
    circle = 'circle',
    title = 'title',
    text = 'text',
    button = 'button',
}

export default Skeleton;
