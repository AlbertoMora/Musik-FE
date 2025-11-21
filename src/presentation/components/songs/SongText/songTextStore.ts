import { IKey, ISongPermission } from '@/infrastructure/models/SongModel';
import { replaceTones } from '@/utils/text-utils';
import { createContext } from 'react';
import { create } from 'zustand';

export interface ISongtextStore {
    id: string;
    permissions: ISongPermission[] | null;

    fontSize: number;
    paragraphSplit: number;
    increaseFontSize: () => void;
    decreaseFontSize: () => void;

    originalChords: IKey[] | [];
    chords: IKey[] | [];

    toneVariation: number;
    setCurrentTone: (ammount: number) => void;

    shouldShowUploadModal: boolean;
    toggleUploadModal: () => void;

    shouldShowRecordModal: boolean;
    toggleRecordModal: () => void;

    resetToneVariation: () => void;

    url?: string;
    setUrl: (url: string) => void;

    isUploading: boolean;
    toggleIsUploading: () => void;

    isProcessFinished: boolean;
    toggleIsProcessFinished: () => void;
}

export const StoreContext = createContext<ISongtextStore | null>(null);

export const createSongtextStore = (
    chords: IKey[],
    id: string,
    permissions: ISongPermission[] | null,
    url?: string
) =>
    create<ISongtextStore>(set => ({
        id,
        permissions,

        fontSize: 16,
        paragraphSplit: 11,
        increaseFontSize: () =>
            set(state => ({
                fontSize: state.fontSize >= 24 ? state.fontSize : state.fontSize + 1,
                paragraphSplit:
                    state.fontSize >= 25 ? state.paragraphSplit : state.paragraphSplit - 2,
            })),
        decreaseFontSize: () =>
            set(state => ({
                fontSize: state.fontSize <= 11 ? state.fontSize : state.fontSize - 1,
                paragraphSplit:
                    state.fontSize <= 10 ? state.paragraphSplit : state.paragraphSplit + 2,
            })),

        originalChords: chords,
        chords,
        toneVariation: 0,
        setCurrentTone: (ammount: number) =>
            set(state => {
                const newChords = replaceTones(ammount, state.chords);
                return { chords: newChords, toneVariation: state.toneVariation + ammount };
            }),
        resetToneVariation: () =>
            set(state => ({ toneVariation: 0, chords: state.originalChords })),

        shouldShowUploadModal: false,
        toggleUploadModal: () =>
            set(state => ({ shouldShowUploadModal: !state.shouldShowUploadModal })),

        shouldShowRecordModal: false,
        toggleRecordModal: () =>
            set(state => ({ shouldShowRecordModal: !state.shouldShowRecordModal })),

        url,
        setUrl: (url: string) => set(() => ({ url })),

        isUploading: false,
        toggleIsUploading: () => set(state => ({ isUploading: !state.isUploading })),

        isProcessFinished: false,
        toggleIsProcessFinished: () =>
            set(state => ({ isProcessFinished: !state.isProcessFinished })),
    }));
