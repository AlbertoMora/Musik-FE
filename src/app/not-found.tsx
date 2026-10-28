import { getI18n } from '@/i18n/dictionaries';
import GeneralNotFound from '@/presentation/components/common/GeneralNotFound';
import { Metadata } from 'next';
import { headers } from 'next/headers';

export async function generateMetadata(): Promise<Metadata> {
    const { notFound } = (await getI18n(headers)) ?? {};

    return {
        title: notFound?.metaTitle ?? '404 | Sonnetia',
        description: notFound?.metaDescription ?? '',
    };
}

export default async function NotFoundPage() {
    const { notFound } = await getI18n(headers);

    return <GeneralNotFound i18n={notFound} />;
}
