import { getI18n } from '@/i18n/dictionaries';
import { getEditorBySlugWithSongsAction } from '@/infrastructure/adapters/editors/editors-actions';
import EditorSongsCatalogClient from '@/presentation/components/editors/EditorSongsCatalogClient';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import React, { cache } from 'react';

import '@/presentation/styles/pages/create-song.sass';
import '@/presentation/styles/pages/repertoires.sass';
import '@/presentation/styles/components/forms.sass';

interface EditorPageParams {
    params: Promise<{ slug: string }>;
}

const getInitialEditorCatalog = cache(async (slug: string) => {
    const res = await getEditorBySlugWithSongsAction(slug, {
        page: 0,
        limit: 9,
        sortBy: 'creation_date',
        sortDir: 'DESC',
    });
    if (!res.success || !res.data || !res.data.editor) {
        return null;
    }
    return res.data;
});

export async function generateMetadata({ params }: EditorPageParams): Promise<Metadata> {
    const { slug } = await params;
    const { editors, app } = await getI18n(headers);
    const data = await getInitialEditorCatalog(slug);

    if (!data) {
        return {
            title: editors.view.metaNotFoundTitle,
            description: editors.view.metaNotFoundDescription,
        };
    }

    return {
        title: `@${data.editor.username} | ${app.title}`,
        description: `@${data.editor.username} - ${app.title}`,
    };
}

export default async function EditorSongsPage({ params }: EditorPageParams) {
    const { slug } = await params;
    const { editors } = await getI18n(headers);
    const data = await getInitialEditorCatalog(slug);

    if (!data) {
        notFound();
    }

    return (
        <div className="w-full create-repertoire-container">
            <EditorSongsCatalogClient
                editor={data.editor}
                isSelf={Boolean(data.isSelf)}
                initialSongs={data.songs ?? []}
                initialCount={data.count ?? 0}
                totalEditorSongs={data.totalEditorSongs ?? 0}
                facets={
                    data.facets ?? {
                        genres: [],
                        keys: [],
                        artists: [],
                        albums: [],
                    }
                }
                i18n={editors.view}
            />
        </div>
    );
}
