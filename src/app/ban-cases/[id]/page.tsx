import React from 'react';
import { headers } from 'next/headers';
import { getI18n } from '@/i18n/dictionaries';
import Unauthorized401 from '@/presentation/components/common/Unauthorized401';
import { getSessionInfoAction } from '@/infrastructure/adapters/auth/auth-actions';
import BanCaseForumPageClient from './BanCaseForumPageClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

const BanCaseForumPage = async ({ params }: PageProps) => {
    const { id } = await params;
    const { unauthorized } = await getI18n(headers);
    const session = await getSessionInfoAction();

    if (!session?.user?.id) {
        return <Unauthorized401 i18n={unauthorized} />;
    }

    return <BanCaseForumPageClient caseId={id} sessionUser={session.user} />;
};

export default BanCaseForumPage;
