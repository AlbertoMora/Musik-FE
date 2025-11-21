import { createContext } from 'react';
import { create } from 'zustand';

export interface IUploadFormStore {
    isUploading: boolean;
    toggleIsUploading: () => void;
    setIsUploading: (newState: boolean) => void;

    isProcessFinished: boolean;
    setIsProcessFinished: (newState: boolean) => void;

    isSuccess: boolean;
    setIsSuccess: (newState: boolean) => void;

    file: File | null;
    setFile: (file: File | null) => void;

    isDragged: boolean;
    toggleIsDragged: () => void;
    setIsDragged: (newState: boolean) => void;

    uploadProgress: number;
    setUploadProgress: (percentage: number) => void;
}

export const UploadFormStoreContext = createContext<IUploadFormStore | null>(null);

export const createUploadFormStoreContext = () =>
    create<IUploadFormStore>(set => ({
        isUploading: false,
        toggleIsUploading: () => set(state => ({ isUploading: !state.isUploading })),
        setIsUploading: (newState: boolean) => set(() => ({ isUploading: newState })),
        isProcessFinished: false,
        setIsProcessFinished: (newState: boolean) => set(() => ({ isProcessFinished: newState })),
        isSuccess: false,
        setIsSuccess: (newState: boolean) => set(() => ({ isSuccess: newState })),
        file: null,
        setFile: (file: File | null) => set(() => ({ file })),
        isDragged: false,
        toggleIsDragged: () => set(state => ({ isDragged: !state.isDragged })),
        setIsDragged: (newState: boolean) => set(() => ({ isDragged: newState })),
        uploadProgress: 0,
        setUploadProgress: (percentage: number) => () => ({ uploadProgress: percentage }),
    }));
