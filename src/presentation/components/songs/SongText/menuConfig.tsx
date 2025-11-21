import {
    IconCaretDown,
    IconCaretUp,
    IconLetterCase,
    IconMath1Divide2,
    IconMicrophone2,
    IconMusic,
    IconMusicMinus,
    IconMusicPlus,
    IconPlayerRecordFilled,
    IconRefresh,
    IconTextGrammar,
    IconUpload,
} from '@tabler/icons-react';
import { ISongtextStore } from './songTextStore';
import { ReactNode } from 'react';

export const menuItems = ({
    setCurrentTone,
    increaseFontSize,
    decreaseFontSize,
    toggleRecordModal,
    toggleUploadModal,
    resetToneVariation,
}: ISongtextStore): IMenuItem[] => [
    {
        Label: <IconMusic />,
        name: 'musicOptions',
        children: [
            {
                Label: <IconRefresh />,
                name: 'resetTone',
                onClick: resetToneVariation,
            },
            {
                Label: (
                    <>
                        <IconMusicPlus />1
                    </>
                ),
                name: 'toneUp',
                onClick: () => setCurrentTone(2),
            },
            {
                Label: (
                    <>
                        <IconMusicPlus />
                        <IconMath1Divide2 />
                    </>
                ),
                name: 'halfToneUp',
                onClick: () => setCurrentTone(1),
            },

            {
                Label: (
                    <>
                        <IconMusicMinus />
                        <IconMath1Divide2 />
                    </>
                ),
                name: 'halfToneDown',
                onClick: () => setCurrentTone(-1),
            },
            {
                Label: (
                    <>
                        <IconMusicMinus />1
                    </>
                ),
                name: 'toneDown',
                onClick: () => setCurrentTone(-2),
            },
        ],
    },
    {
        Label: <IconTextGrammar />,
        name: 'textOptions',
        children: [
            {
                Label: (
                    <>
                        <IconLetterCase />
                        <IconCaretUp size={15} />
                    </>
                ),
                name: 'increaseFont',
                onClick: increaseFontSize,
            },
            {
                Label: (
                    <>
                        <IconLetterCase />
                        <IconCaretDown size={15} />
                    </>
                ),
                name: 'decreaseFont',
                onClick: decreaseFontSize,
            },
        ],
    },
    {
        Label: <IconMicrophone2 />,
        name: 'recordOptions',
        children: [
            {
                Label: <IconPlayerRecordFilled />,
                name: 'recordSample',
                permissionsToShow: ['can_edit'],
                onClick: toggleRecordModal,
            },
            {
                Label: <IconUpload />,
                name: 'uploadSample',
                permissionsToShow: ['can_edit'],
                onClick: toggleUploadModal,
            },
        ],
    },
];

export interface IMenuCommonProps {
    name: string;
    permissionsToShow?: string[] | null;
}
interface IMenuItem extends IMenuCommonProps {
    Label: ReactNode;
    children?: IMenuChild[] | null;
}

interface IMenuChild extends IMenuCommonProps {
    Label: ReactNode;
    onClick: (e: unknown) => unknown;
}
