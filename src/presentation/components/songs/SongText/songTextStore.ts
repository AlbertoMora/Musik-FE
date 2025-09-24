import { IKey } from '@/infrastructure/models/SongModel';
import { replaceTones } from '@/utils/text-utils';
import { createContext } from 'react';
import { create } from 'zustand';

export interface ISongtextStore {
    id: string;

    fontSize: number;
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
}

export const StoreContext = createContext<ISongtextStore | null>(null);

export const createSongtextStore = (chords: IKey[], id: string) =>
    create<ISongtextStore>(set => ({
        id,
        fontSize: 16,
        increaseFontSize: () =>
            set(state => ({
                fontSize: state.fontSize >= 24 ? state.fontSize : state.fontSize + 1,
            })),
        decreaseFontSize: () =>
            set(state => ({
                fontSize: state.fontSize <= 11 ? state.fontSize : state.fontSize - 1,
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
    }));
