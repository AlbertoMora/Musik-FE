import React from 'react';
import { Divider } from '@mantine/core';

import CreateSongBreadcrumb from './CreateSongBreadcrumb';
import H1 from '@/presentation/components/headings/H1';

import '@/presentation/styles/pages/create-song.sass';
import '@/presentation/styles/components/forms.sass';
import '@/presentation/styles/components/asyncacomplete.sass';
import CreateSongForm from './CreateSongForm';
import { headers } from 'next/headers';
import { getI18n } from '@/i18n/dictionaries';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const { app, lyrics } = (await getI18n(headers)) ?? {};

    return {
        title: `${lyrics?.create?.title ?? 'Create Lyrics'} | ${app?.title ?? 'Sonnetia'}`,
        description: `${lyrics?.create?.breadcrumb?.create ?? 'Create'} ${
            lyrics?.create?.title ?? 'Lyrics'
        }`,
    };
}

const CreateSongPage = async () => {
    const { lyrics } = (await getI18n(headers)) ?? {};
    return (
        <div className='w-full create-song-container'>
            <H1 className='text-center'>{lyrics.create.title}</H1>
            <CreateSongBreadcrumb {...lyrics.create.breadcrumb} />
            <Divider className='w-full' />
            <CreateSongForm i18n={lyrics.create.form} />
        </div>
    );
};

export default CreateSongPage;
