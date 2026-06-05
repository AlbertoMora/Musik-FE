import React from 'react';
import { headers } from 'next/headers';
import { getI18n } from '@/i18n/dictionaries';
import AccountPageClient from '@/app/account/AccountPageClient';
import '@/presentation/styles/pages/account.sass';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const { app } = (await getI18n(headers)) ?? {};

    return {
        title: `${app?.accountPage?.menuTitle ?? 'Account'} | ${app?.title ?? 'Sonnetia'}`,
        description: app?.accountPage?.hero?.kicker,
    };
}

const AccountPage = async () => {
    const { app } = (await getI18n(headers)) ?? {};

    return <AccountPageClient i18n={app.accountPage} />;
};

export default AccountPage;
