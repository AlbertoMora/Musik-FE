import React from 'react';
import { headers } from 'next/headers';
import { getI18n } from '@/i18n/dictionaries';
import Unauthorized401 from '@/presentation/components/common/Unauthorized401';
import { getSessionInfoAction } from '@/infrastructure/adapters/auth/auth-actions';
import BugtrackerPageClient from './BugtrackerPageClient';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const { app, unauthorized, bugtracker } = (await getI18n(headers)) ?? {};
    const session = await getSessionInfoAction();
    const hasAccess = Boolean(session?.user?.isAdmin || session?.user?.isDeveloper);

    if (!session?.user?.id || !hasAccess) {
        return {
            title: unauthorized?.metaTitle ?? '401 | Sonnetia',
            description: unauthorized?.metaDescription ?? '',
        };
    }

    return {
        title: `${bugtracker?.metaTitle ?? 'Bugtracker'} | ${app?.title ?? 'Sonnetia'}`,
        description: bugtracker?.metaDescription ?? '',
    };
}

const BugtrackerPage = async () => {
    const { unauthorized, bugtracker } = await getI18n(headers);
    const session = await getSessionInfoAction();
    const hasAccess = Boolean(session?.user?.isAdmin || session?.user?.isDeveloper);

    if (!session?.user?.id || !hasAccess) {
        return <Unauthorized401 i18n={unauthorized} />;
    }

    return <BugtrackerPageClient sessionUser={session.user} i18n={bugtracker} />;
};

export default BugtrackerPage;
