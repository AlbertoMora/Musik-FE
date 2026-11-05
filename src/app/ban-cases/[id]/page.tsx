import React from 'react';
import { headers } from 'next/headers';
import { getI18n } from '@/i18n/dictionaries';
import Unauthorized401 from '@/presentation/components/common/Unauthorized401';
import { getSessionInfoAction } from '@/infrastructure/adapters/auth/auth-actions';
import BanCaseForumPageClient from './BanCaseForumPageClient';
import { Metadata } from 'next';

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
    const { app, banCaseForum } = (await getI18n(headers)) ?? {};

    return {
        title: `${banCaseForum?.metaTitle ?? 'Foro de Moderación'} | ${app?.title ?? 'Sonnetia'}`,
        description: banCaseForum?.metaDescription ?? '',
    };
}

const BanCaseForumPage = async ({ params }: PageProps) => {
    const { id } = await params;
    const { unauthorized, banCaseForum } = await getI18n(headers);
    const session = await getSessionInfoAction();

    if (!session?.user?.id) {
        return <Unauthorized401 i18n={unauthorized} />;
    }

    return (
        <BanCaseForumPageClient
            caseId={id}
            sessionUser={session.user}
            i18n={banCaseForum}
        />
    );
};

export default BanCaseForumPage;
