import React from 'react';
import { Divider, Text } from '@mantine/core';
import { headers } from 'next/headers';
import { Metadata } from 'next';

import { getI18n } from '@/i18n/dictionaries';
import H1 from '@/presentation/components/headings/H1';
import Unauthorized401 from '@/presentation/components/common/Unauthorized401';
import { getSessionInfoAction } from '@/infrastructure/adapters/auth/auth-actions';
import { getRepertoiresAction } from '@/infrastructure/adapters/repertoires/repertoires-actions';
import MyRepertoiresClient from '@/presentation/components/repertoires/MyRepertoiresClient';

import '@/presentation/styles/pages/create-song.sass';
import '@/presentation/styles/pages/repertoires.sass';
import '@/presentation/styles/components/forms.sass';

export async function generateMetadata(): Promise<Metadata> {
    const { app, repertoires, unauthorized } = (await getI18n(headers)) ?? {};
    const session = await getSessionInfoAction();

    if (!session?.user?.id) {
        return {
            title: unauthorized?.metaTitle ?? '401 | Sonnetia',
            description: unauthorized?.metaDescription ?? '',
        };
    }

    return {
        title: `${repertoires?.myRepertoires?.title ?? 'Mis Repertorios'} | ${app?.title ?? 'Sonnetia'}`,
        description: repertoires?.myRepertoires?.subtitle ?? '',
    };
}

export default async function MyRepertoiresPage() {
    const { repertoires, unauthorized } = await getI18n(headers);
    const session = await getSessionInfoAction();

    if (!session?.user?.id) {
        return <Unauthorized401 i18n={unauthorized} />;
    }

    const res = await getRepertoiresAction(0, 9);

    const initialRepertoires = res.success && res.data ? res.data.repertoires : [];
    const initialCount = res.success && res.data ? res.data.count : 0;

    return (
        <div className="w-full create-repertoire-container">
            <H1 className="text-center">{repertoires.myRepertoires.title}</H1>
            <Text ta="center" c="dimmed" size="sm" mb="md">
                {repertoires.myRepertoires.subtitle}
            </Text>
            <Divider className="w-full" />
            <MyRepertoiresClient
                initialRepertoires={initialRepertoires}
                initialCount={initialCount}
                i18n={repertoires.myRepertoires}
            />
        </div>
    );
}
