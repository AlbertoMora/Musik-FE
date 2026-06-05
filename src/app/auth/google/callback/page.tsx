import { getI18n } from '@/i18n/dictionaries';
import { headers } from 'next/headers';
import { Metadata } from 'next';

import React from 'react';
import CallbackManager from './CallbackManager';

interface ISearchParamsProps {
    code: string;
    scope: string;
    authuser: string;
    promp: string;
}

interface IProps {
    searchParams: Promise<ISearchParamsProps>;
}

export async function generateMetadata(): Promise<Metadata> {
    const {
        app: { title, navbar },
    } = (await getI18n(headers)) ?? {};

    return {
        title: `Google callback | ${title ?? 'Sonnetia'}`,
        description: navbar?.auth?.login?.oauth?.validating,
    };
}

const Page = async ({ searchParams }: IProps) => {
    const {
        app: { navbar },
    } = (await getI18n(headers)) ?? {};

    const data = await searchParams;

    return <CallbackManager code={data.code} i18n={navbar.auth.login.oauth} />;
};

export default Page;
