import React from 'react';
import { headers } from 'next/headers';
import { getI18n } from '@/i18n/dictionaries';
import AccountPageClient from '@/app/account/AccountPageClient';
import Unauthorized401 from '@/presentation/components/common/Unauthorized401';
import { getSessionInfoAction } from '@/infrastructure/adapters/auth/auth-actions';
import '@/presentation/styles/pages/account.sass';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const { app, unauthorized } = (await getI18n(headers)) ?? {};
    const session = await getSessionInfoAction();

    if (!session?.user?.id) {
        return {
            title: unauthorized?.metaTitle ?? '401 | Sonnetia',
            description: unauthorized?.metaDescription ?? '',
        };
    }

    return {
        title: `${app?.accountPage?.menuTitle ?? 'Account'} | ${app?.title ?? 'Sonnetia'}`,
        description: app?.accountPage?.hero?.kicker,
    };
}

const AccountPage = async () => {
    const { app, unauthorized } = await getI18n(headers);
    const session = await getSessionInfoAction();

    if (!session?.user?.id) {
        return <Unauthorized401 i18n={unauthorized} />;
    }

    return <AccountPageClient i18n={app.accountPage} />;
};

export default AccountPage;
