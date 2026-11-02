import { getI18n } from '@/i18n/dictionaries';
import { getSessionInfoAction } from '@/infrastructure/adapters/auth/auth-actions';
import { getRepertoireAction } from '@/infrastructure/adapters/repertoires/repertoires-actions';
import Unauthorized401 from '@/presentation/components/common/Unauthorized401';
import RepertoireNotFound from '@/presentation/components/repertoires/RepertoireNotFound';
import RepertoireViewer from '@/presentation/components/repertoires/RepertoireViewer';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { cache } from 'react';

import '@/presentation/styles/pages/repertoires.sass';
import '@/presentation/styles/components/floating-button-menu.sass';

interface PageParams {
    params: Promise<{ slug: string }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

const extractEditToken = (
    searchParams?: { [key: string]: string | string[] | undefined },
): string | undefined => {
    const raw = searchParams?.editToken ?? searchParams?.linkToken ?? searchParams?.link;
    return typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;
};

const getRepertoireData = cache(async (slug: string, editToken?: string) => {
    const res = await getRepertoireAction(slug, editToken);
    if (!res.success || !res.data || !res.data.repertoire) {
        return null;
    }
    return res.data;
});

export const generateMetadata = async ({
    params,
    searchParams,
}: PageParams): Promise<Metadata> => {
    const { slug } = await params;
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const editToken = extractEditToken(resolvedSearchParams);

    const {
        repertoires: { view },
        unauthorized,
    } = await getI18n(headers);

    const session = await getSessionInfoAction();
    if (!session?.user?.id) {
        return {
            title: unauthorized.metaTitle,
            description: unauthorized.metaDescription,
        };
    }

    const data = await getRepertoireData(slug, editToken);

    if (!data) {
        return {
            title: view.metaNotFoundTitle,
            description: view.metaNotFoundDescription,
        };
    }

    return {
        title: `${data.repertoire.name} | Sonnetia`,
        description: data.repertoire.name,
    };
};

const RepertoirePage = async ({ params, searchParams }: PageParams) => {
    const { slug } = await params;
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const editToken = extractEditToken(resolvedSearchParams);

    const {
        lyrics: { text: lyricsTextI18n },
        repertoires: { view: viewI18n },
        unauthorized,
    } = await getI18n(headers);

    const session = await getSessionInfoAction();
    if (!session?.user?.id) {
        return <Unauthorized401 i18n={unauthorized} />;
    }

    const data = await getRepertoireData(slug, editToken);

    if (!data) {
        return <RepertoireNotFound i18n={viewI18n} />;
    }

    return (
        <RepertoireViewer
            repertoire={data.repertoire}
            repertoireSlug={data.slug?.slug ?? slug}
            editToken={editToken}
            songs={data.songs ?? []}
            editors={data.editors ?? []}
            permissions={data.permissions}
            lyricsI18n={lyricsTextI18n}
            viewI18n={viewI18n}
        />
    );
};

export default RepertoirePage;
