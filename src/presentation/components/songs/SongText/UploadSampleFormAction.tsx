import {
    postRecordAction,
    updateSongSampleAction,
} from '@/infrastructure/adapters/songs/songs-actions';
import { ISongtextStore } from './songTextStore';
import { controlledFileUploadRequest } from '@/utils/web-utils';

export const UploadSampleActions = {
    getPresignedUrl: async (file?: File | null, id?: string) => {
        if (!id || !file) return null;
        const res = await postRecordAction(file.name, file.type, id);
        return res.success ? res.data : null;
    },
    uploadToS3: async (
        file?: File | null,
        presignedUrl?: string,
        setUploadProgress?: (value: number) => void
    ) => {
        if (!presignedUrl || !file || !setUploadProgress) return false;
        const response = await controlledFileUploadRequest(presignedUrl, file, setUploadProgress);
        return response.success;
    },
    updateSong: async (key: string, store?: ISongtextStore | null) => {
        if (!store) return false;

        //remove sample if it cannot update

        const res = await updateSongSampleAction(key, store.id);
        if (!res.success || !res.data?.url) return false;

        store.setUrl(res.data.url);
        return true;
    },
};
