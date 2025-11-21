import { getI18n } from '@/i18n/dictionaries';
import { headers } from 'next/headers';

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

const Page = async ({ searchParams }: IProps) => {
    const {
        app: { navbar },
    } = (await getI18n(headers)) ?? {};

    const data = await searchParams;

    return <CallbackManager code={data.code} i18n={navbar.auth.login.oauth} />;
};

export default Page;
