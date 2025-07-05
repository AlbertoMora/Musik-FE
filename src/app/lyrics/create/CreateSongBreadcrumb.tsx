import { Anchor, Breadcrumbs } from '@mantine/core';
import React from 'react';
import { v4 as uuid } from 'uuid';

import '@/presentation/styles/components/breadcrumbs.sass';

interface ICSBreadcrumbProps {
    home: string;
    songs: string;
    lyrics: string;
    create: string;
}

const getItems = ({ home, lyrics, create, songs }: ICSBreadcrumbProps) =>
    [
        { title: home, href: '/' },
        { title: songs, href: '/lyrics' },
        { title: lyrics, href: '/lyrics/me' },
        { title: create },
    ].map(item =>
        item.href ? (
            <Anchor href={item.href} key={uuid()} className='breadcrumb-anchor' size='sm'>
                {item.title}
            </Anchor>
        ) : (
            item.title
        )
    );

const CreateSongBreadcrumb = (i18n: ICSBreadcrumbProps) => {
    return (
        <Breadcrumbs aria-label='Default breadcrumb example' className='self-start ml-5 mb-3'>
            {getItems(i18n)}
        </Breadcrumbs>
    );
};

export default CreateSongBreadcrumb;
