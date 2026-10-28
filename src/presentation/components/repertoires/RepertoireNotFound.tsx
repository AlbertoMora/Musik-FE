'use client';

import { I18nTypes } from '@/i18n/dictionaries';
import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconHome, IconPlaylist } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import '../../styles/pages/songs.sass';

interface RepertoireNotFoundProps {
    i18n: I18nTypes['repertoires']['view'];
    redirectDelaySeconds?: number;
}

const LockedRepertoireIllustration = () => (
    <svg
        className="song-not-found-svg"
        viewBox="0 0 280 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <defs>
            <radialGradient id="rnfGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.34" />
                <stop offset="65%" stopColor="#ec4899" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="rnfCover" x1="85" y1="35" x2="195" y2="165" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3b0764" />
                <stop offset="50%" stopColor="#1e1b4b" />
                <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="rnfAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c4b5fd" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
        </defs>

        <circle cx="140" cy="100" r="92" fill="url(#rnfGlow)" />

        {/* Setlist binder / folder */}
        <rect
            x="84"
            y="36"
            width="112"
            height="132"
            rx="12"
            fill="url(#rnfCover)"
            stroke="url(#rnfAccent)"
            strokeWidth="2.2"
        />
        <line x1="100" y1="36" x2="100" y2="168" stroke="#a78bfa" strokeOpacity="0.35" strokeWidth="1.5" />

        {/* Binder rings */}
        <rect x="77" y="56" width="14" height="6" rx="3" fill="#c4b5fd" />
        <rect x="77" y="98" width="14" height="6" rx="3" fill="#c4b5fd" />
        <rect x="77" y="140" width="14" height="6" rx="3" fill="#c4b5fd" />

        {/* Padlock in center */}
        <path
            d="M132 92 V81 C132 72, 160 72, 160 81 V92"
            stroke="#f472b6"
            strokeWidth="3"
            strokeLinecap="round"
        />
        <rect
            x="124"
            y="92"
            width="44"
            height="36"
            rx="8"
            fill="#1e1b4b"
            stroke="url(#rnfAccent)"
            strokeWidth="2"
        />
        <circle cx="146" cy="107" r="4" fill="#f472b6" />
        <path d="M146 111 V119" stroke="#f472b6" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
);

export default function RepertoireNotFound({
    i18n,
    redirectDelaySeconds = 7,
}: RepertoireNotFoundProps) {
    const router = useRouter();
    const [secondsLeft, setSecondsLeft] = useState(redirectDelaySeconds);

    useEffect(() => {
        if (secondsLeft <= 0) {
            router.push('/');
            return;
        }
        const timer = window.setTimeout(() => {
            setSecondsLeft(prev => prev - 1);
        }, 1000);
        return () => window.clearTimeout(timer);
    }, [secondsLeft, router]);

    const redirectMessage = i18n.redirectNotice.replace('{seconds}', String(Math.max(0, secondsLeft)));

    return (
        <div className="song-not-found-wrapper">
            <div className="song-not-found-card">
                <div className="song-not-found-illustration">
                    <LockedRepertoireIllustration />
                </div>

                <Stack gap="sm" align="center" ta="center">
                    <span className="song-not-found-badge">{i18n.forbiddenBadge}</span>
                    <Title order={2} className="song-not-found-title">
                        {i18n.forbiddenTitle}
                    </Title>
                    <Text className="song-not-found-description">{i18n.forbiddenDescription}</Text>
                </Stack>

                <div className="song-not-found-countdown">
                    <span className="song-not-found-pulse" />
                    <Text size="sm" fw={500}>
                        {redirectMessage}
                    </Text>
                </div>

                <Group justify="center" gap="md" wrap="wrap" mt="xs">
                    <Button
                        component={Link}
                        href="/"
                        size="md"
                        radius="xl"
                        color="violet"
                        leftSection={<IconHome size={18} />}
                    >
                        {i18n.goHomeButton}
                    </Button>
                    <Button
                        component={Link}
                        href="/my-repertoires"
                        size="md"
                        radius="xl"
                        variant="light"
                        color="gray"
                        leftSection={<IconPlaylist size={18} />}
                    >
                        {i18n.myRepertoiresButton}
                    </Button>
                </Group>
            </div>
        </div>
    );
}
