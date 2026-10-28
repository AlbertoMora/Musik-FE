import React from 'react';
import { Divider, Text } from '@mantine/core';
import { headers } from 'next/headers';
import { Metadata } from 'next';

import { getI18n } from '@/i18n/dictionaries';
import H1 from '@/presentation/components/headings/H1';
import Unauthorized401 from '@/presentation/components/common/Unauthorized401';
import { getSessionInfoAction } from '@/infrastructure/adapters/auth/auth-actions';
import CreateRepertoireBreadcrumb from './CreateRepertoireBreadcrumb';
import CreateRepertoireForm from './CreateRepertoireForm';

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
        title: `${repertoires?.create?.title ?? 'Crear Repertorio'} | ${app?.title ?? 'Sonnetia'}`,
        description: repertoires?.create?.subtitle ?? '',
    };
}

const CreateRepertoirePage = async () => {
    const { repertoires, unauthorized } = await getI18n(headers);
    const session = await getSessionInfoAction();

    if (!session?.user?.id) {
        return <Unauthorized401 i18n={unauthorized} />;
    }

    return (
        <div className="w-full create-repertoire-container">
            <H1 className="text-center">{repertoires.create.title}</H1>
            <Text ta="center" c="dimmed" size="sm" mb="xs">
                {repertoires.create.subtitle}
            </Text>
            <CreateRepertoireBreadcrumb {...repertoires.create.breadcrumb} />
            <Divider className="w-full" />
            <CreateRepertoireForm i18n={repertoires.create.form} />
        </div>
    );
};

export default CreateRepertoirePage;
