'use server';

import { IEditorSongsFilterParams } from '@/domain/editors/editor-gateway';
import { getSessionCookieValues } from '../auth/auth-actions';
import { EditorsFromMicroAdapter } from './editors-from-micro-adapter';

export const getEditorBySlugWithSongsAction = async (
    slug: string,
    filters?: IEditorSongsFilterParams,
) => {
    const editorAdapter = new EditorsFromMicroAdapter();
    const [accessToken] = await getSessionCookieValues();
    return await editorAdapter.getEditorBySlugWithSongs(slug, filters, accessToken);
};
