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
}

const getRepertoireData = cache(async (slug: string) => {
    const res = await getRepertoireAction(slug);
    if (!res.success || !res.data || !res.data.repertoire) {
        return null;
    }
    return res.data;
});

export const generateMetadata = async ({ params }: PageParams): Promise<Metadata> => {
    const { slug } = await params;

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

    const data = await getRepertoireData(slug);

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

const RepertoirePage = async ({ params }: PageParams) => {
    const { slug } = await params;

    const {
        lyrics: { text: lyricsTextI18n },
        repertoires: { view: viewI18n },
        unauthorized,
    } = await getI18n(headers);

    const session = await getSessionInfoAction();
    if (!session?.user?.id) {
        return <Unauthorized401 i18n={unauthorized} />;
    }

    const data = await getRepertoireData(slug);

    if (!data) {
        return <RepertoireNotFound i18n={viewI18n} />;
    }

    return (
        <RepertoireViewer
            repertoire={data.repertoire}
            songs={data.songs ?? []}
            permissions={data.permissions}
            lyricsI18n={lyricsTextI18n}
            viewI18n={viewI18n}
        />
    );
};

export default RepertoirePage;
