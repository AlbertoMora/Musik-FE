'use client';
import { ActionIcon, Tooltip, useMantineColorScheme } from '@mantine/core';
import { IconMoon, IconSun } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface IThemeToggleProps {
    i18n: {
        toDark: string;
        toLight: string;
    };
}

const ThemeToggle = ({ i18n }: IThemeToggleProps) => {
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');
    const { setColorScheme } = useMantineColorScheme();

    useEffect(() => {
        const stored = localStorage.getItem('theme') as 'dark' | 'light' | null;
        const initial =
            stored ??
            (globalThis.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        setTheme(initial);
        document.documentElement.dataset.theme = initial;
        setColorScheme(initial);
    }, [setColorScheme]);

    const toggle = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        setColorScheme(next);
        document.documentElement.dataset.theme = next;
        localStorage.setItem('theme', next);
    };

    return (
        <Tooltip label={theme === 'dark' ? i18n.toLight : i18n.toDark}>
            <ActionIcon
                onClick={toggle}
                variant='subtle'
                color='gray'
                size='lg'
                aria-label={theme === 'dark' ? i18n.toLight : i18n.toDark}>
                {theme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
            </ActionIcon>
        </Tooltip>
    );
};

export default ThemeToggle;
