import React from 'react';
import { headers } from 'next/headers';
import { getI18n } from '@/i18n/dictionaries';
import Unauthorized401 from '@/presentation/components/common/Unauthorized401';
import { getSessionInfoAction } from '@/infrastructure/adapters/auth/auth-actions';
import AdminUsersPageClient from './AdminUsersPageClient';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const { app, unauthorized } = (await getI18n(headers)) ?? {};
    const session = await getSessionInfoAction();
    const isAdmin = Boolean(session?.user?.isAdmin);

    if (!session?.user?.id || !isAdmin) {
        return {
            title: unauthorized?.metaTitle ?? '401 | Sonnetia',
            description: unauthorized?.metaDescription ?? '',
        };
    }

    return {
        title: `Administración de Usuarios y Foro | ${app?.title ?? 'Sonnetia'}`,
        description: 'Gestión de roles, permisos y foro de moderación de usuarios en Sonnetia',
    };
}

const AdminUsersPage = async () => {
    const { unauthorized } = await getI18n(headers);
    const session = await getSessionInfoAction();
    const isAdmin = Boolean(session?.user?.isAdmin);

    if (!session?.user?.id || !isAdmin) {
        return <Unauthorized401 i18n={unauthorized} />;
    }

    return <AdminUsersPageClient sessionUser={session.user} />;
};

export default AdminUsersPage;
