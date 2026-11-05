import React from 'react';
import { headers } from 'next/headers';
import { getI18n } from '@/i18n/dictionaries';
import Unauthorized401 from '@/presentation/components/common/Unauthorized401';
import { getSessionInfoAction } from '@/infrastructure/adapters/auth/auth-actions';
import AdminUsersPageClient from './AdminUsersPageClient';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const { app, unauthorized, admin } = (await getI18n(headers)) ?? {};
    const session = await getSessionInfoAction();
    const isAdmin = Boolean(session?.user?.isAdmin);

    if (!session?.user?.id || !isAdmin) {
        return {
            title: unauthorized?.metaTitle ?? '401 | Sonnetia',
            description: unauthorized?.metaDescription ?? '',
        };
    }

    return {
        title: `${admin?.metaTitle ?? 'Admin'} | ${app?.title ?? 'Sonnetia'}`,
        description: admin?.metaDescription ?? '',
    };
}

const AdminUsersPage = async () => {
    const { unauthorized, admin } = await getI18n(headers);
    const session = await getSessionInfoAction();
    const isAdmin = Boolean(session?.user?.isAdmin);

    if (!session?.user?.id || !isAdmin) {
        return <Unauthorized401 i18n={unauthorized} />;
    }

    return <AdminUsersPageClient sessionUser={session.user} i18n={admin} />;
};

export default AdminUsersPage;
