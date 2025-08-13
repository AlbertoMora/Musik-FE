import { UseCounterHandlers } from '@mantine/hooks';
import {
    IconCaretDown,
    IconCaretUp,
    IconLetterCase,
    IconMath1Divide2,
    IconMusic,
    IconMusicMinus,
    IconMusicPlus,
    IconTextGrammar,
} from '@tabler/icons-react';

export const menuItems = (
    fontSizeHandlers: UseCounterHandlers,
    setChords: (ammount: number) => void
) => [
    {
        Label: IconMusic,
        name: 'MusicButton',
        children: [
            {
                Label: (
                    <>
                        <IconMusicPlus />1
                    </>
                ),
                name: 'oneToneUp',
                onClick: () => setChords(2),
            },
            {
                Label: (
                    <>
                        <IconMusicPlus />
                        <IconMath1Divide2 />
                    </>
                ),
                name: 'halfToneUp',
                onClick: () => setChords(1),
            },

            {
                Label: (
                    <>
                        <IconMusicMinus />
                        <IconMath1Divide2 />
                    </>
                ),
                name: 'halfToneDown',
                onClick: () => setChords(-1),
            },
            {
                Label: (
                    <>
                        <IconMusicMinus />1
                    </>
                ),
                name: 'oneToneDown',
                onClick: () => setChords(-2),
            },
        ],
    },
    {
        Label: IconTextGrammar,
        name: 'textOptions',
        children: [
            {
                Label: (
                    <>
                        <IconLetterCase />
                        <IconCaretUp size={15} />
                    </>
                ),
                name: 'FontSizeUp',
                onClick: fontSizeHandlers.increment,
            },
            {
                Label: (
                    <>
                        <IconLetterCase />
                        <IconCaretDown size={15} />
                    </>
                ),
                name: 'FontSizeDown',
                onClick: fontSizeHandlers.decrement,
            },
        ],
    },
];
