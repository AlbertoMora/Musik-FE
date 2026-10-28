'use client';

import { I18nTypes } from '@/i18n/dictionaries';
import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconHome, IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import '../../styles/pages/songs.sass';

interface GeneralNotFoundProps {
    i18n: I18nTypes['notFound'];
    redirectDelaySeconds?: number;
}

const SadGuitaristIllustration = () => (
    <svg
        className="song-not-found-svg"
        viewBox="0 0 320 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <defs>
            <radialGradient id="gnfGlow" cx="50%" cy="52%" r="50%">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.34" />
                <stop offset="65%" stopColor="#ec4899" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="gnfGuitarBody" x1="115" y1="95" x2="215" y2="175" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="55%" stopColor="#4c1d95" />
                <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
            <linearGradient id="gnfJacket" x1="120" y1="80" x2="200" y2="160" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#312e81" />
                <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="gnfAccent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c4b5fd" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
            <linearGradient id="gnfFloor" x1="40" y1="192" x2="280" y2="192" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </linearGradient>
        </defs>

        {/* Stage ambient spotlight */}
        <circle cx="160" cy="112" r="102" fill="url(#gnfGlow)" />
        <ellipse cx="160" cy="192" rx="115" ry="9" fill="url(#gnfFloor)" />

        {/* Empty / turned-inside-out spare strings pack on the floor (left) */}
        <g transform="rotate(-14 68 168)">
            <rect
                x="44"
                y="148"
                width="46"
                height="38"
                rx="6"
                fill="#1e1b4b"
                stroke="#a78bfa"
                strokeWidth="1.5"
                strokeDasharray="4 2"
            />
            <path d="M44 158 H90" stroke="#a78bfa" strokeWidth="1.2" strokeOpacity="0.5" />
            <circle cx="67" cy="171" r="8" stroke="#f472b6" strokeWidth="1.4" strokeDasharray="3 2" />
            <path d="M62 166 L72 176 M72 166 L62 176" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Floating thought bubble: "0 spares / broken string" (top right) */}
        <g className="song-not-found-svg-float-right">
            <circle cx="222" cy="64" r="3" fill="#c4b5fd" opacity="0.65" />
            <circle cx="232" cy="54" r="4.5" fill="#c4b5fd" opacity="0.75" />
            <rect
                x="236"
                y="22"
                width="64"
                height="36"
                rx="14"
                fill="#1e1b4b"
                stroke="url(#gnfAccent)"
                strokeWidth="1.8"
            />
            {/* Coiled string icon with slash */}
            <circle cx="255" cy="40" r="8" stroke="#c4b5fd" strokeWidth="1.6" strokeDasharray="4 2" />
            <path d="M248 47 L262 33" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
            <text
                x="280"
                y="45"
                textAnchor="middle"
                fill="#f9a8d4"
                fontSize="13"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
            >
                ×0
            </text>
        </g>

        {/* Sad Guitarist sitting cross-legged */}
        {/* Legs */}
        <path
            d="M118 176 C128 190, 192 190, 202 176"
            stroke="#1e1b4b"
            strokeWidth="14"
            strokeLinecap="round"
        />
        <path
            d="M122 178 C135 188, 185 188, 198 178"
            stroke="#4c1d95"
            strokeWidth="6"
            strokeLinecap="round"
        />

        {/* Torso / slumped shoulders */}
        <path
            d="M126 98 C126 84, 194 84, 194 98 L202 162 C202 170, 118 170, 118 162 Z"
            fill="url(#gnfJacket)"
            stroke="#8b5cf6"
            strokeWidth="1.6"
        />

        {/* Head (tilted down sadly) */}
        <g transform="rotate(8 160 64)">
            {/* Hair / Beanie */}
            <path
                d="M136 56 C136 36, 184 36, 184 56 Z"
                fill="#6d28d9"
                stroke="#c4b5fd"
                strokeWidth="1.5"
            />
            <circle cx="160" cy="39" r="4.5" fill="#f472b6" />
            {/* Face */}
            <circle cx="160" cy="64" r="21" fill="#fde68a" stroke="#c4b5fd" strokeWidth="1.4" />
            {/* Sad eyebrows */}
            <path d="M147 56 L155 59" stroke="#1e1b4b" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M173 56 L165 59" stroke="#1e1b4b" strokeWidth="2.2" strokeLinecap="round" />
            {/* Closed sad eyes */}
            <path d="M148 63 Q151 66 154 63" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
            <path d="M166 63 Q169 66 172 63" stroke="#1e1b4b" strokeWidth="2" strokeLinecap="round" />
            {/* Animated tear drop */}
            <path
                className="song-not-found-svg-float-left"
                d="M146 67 C144 71, 144 75, 146 76 C148 75, 148 71, 146 67 Z"
                fill="#38bdf8"
            />
            {/* Sad frown */}
            <path d="M153 75 Q160 69 167 75" stroke="#1e1b4b" strokeWidth="2.2" strokeLinecap="round" />
        </g>

        {/* Acoustic / Electric Guitar held across lap */}
        <g transform="rotate(-14 165 138)">
            {/* Guitar Body (figure-8 contour) */}
            <path
                d="M112 118 C92 116, 86 156, 112 158 C126 159, 134 150, 146 150 C158 150, 166 162, 182 160 C204 158, 204 116, 182 114 C166 112, 158 124, 146 124 C134 124, 126 119, 112 118 Z"
                fill="url(#gnfGuitarBody)"
                stroke="url(#gnfAccent)"
                strokeWidth="2.2"
            />
            {/* Soundhole */}
            <circle cx="152" cy="137" r="13" fill="#0f172a" stroke="#c4b5fd" strokeWidth="1.8" />
            {/* Bridge */}
            <rect x="118" y="127" width="5" height="20" rx="2" fill="#f472b6" />

            {/* Guitar Neck & Headstock */}
            <rect x="196" y="131" width="62" height="12" rx="3" fill="#312e81" stroke="#c4b5fd" strokeWidth="1.5" />
            <path
                d="M258 128 L278 125 L278 149 L258 146 Z"
                fill="#4c1d95"
                stroke="#f472b6"
                strokeWidth="1.6"
            />
            {/* Tuning pegs */}
            <circle cx="266" cy="122" r="2.2" fill="#c4b5fd" />
            <circle cx="274" cy="121" r="2.2" fill="#c4b5fd" />
            <circle cx="266" cy="152" r="2.2" fill="#c4b5fd" />
            <circle cx="274" cy="153" r="2.2" fill="#c4b5fd" />

            {/* Snapped / curled guitar strings */}
            {/* Broken string 1 curling up */}
            <path
                d="M123 131 H168 C178 131, 182 114, 173 108 C166 104, 160 114, 168 118"
                stroke="#f472b6"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            {/* Broken string 2 curling down */}
            <path
                d="M123 137 H162 C174 137, 178 158, 168 166 C160 172, 155 160, 163 156"
                stroke="#c4b5fd"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            {/* Broken string 3 hanging from headstock */}
            <path
                d="M258 135 H208 C196 135, 192 116, 202 108"
                stroke="#f472b6"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            {/* Broken string 4 hanging loose from neck */}
            <path
                d="M258 141 H214 C202 141, 200 162, 210 168"
                stroke="#c4b5fd"
                strokeWidth="1.6"
                strokeLinecap="round"
            />
            {/* Snap spark in the middle */}
            <path
                d="M186 126 L192 120 M188 148 L195 154"
                stroke="#fbbf24"
                strokeWidth="1.8"
                strokeLinecap="round"
            />
        </g>

        {/* Guitarist hands resting helplessly */}
        <circle cx="132" cy="136" r="6.5" fill="#fde68a" stroke="#1e1b4b" strokeWidth="1.4" />
        <circle cx="196" cy="128" r="6.5" fill="#fde68a" stroke="#1e1b4b" strokeWidth="1.4" />

        {/* Floating broken musical notes (top left) */}
        <g className="song-not-found-svg-float-left">
            <text
                x="62"
                y="68"
                fill="#c4b5fd"
                fontSize="22"
                fontWeight="700"
                fontFamily="system-ui, sans-serif"
                opacity="0.85"
            >
                404
            </text>
            <path d="M56 76 L98 76" stroke="#f472b6" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 4" />
        </g>
    </svg>
);

export default function GeneralNotFound({ i18n, redirectDelaySeconds = 8 }: GeneralNotFoundProps) {
    const router = useRouter();
    const [secondsLeft, setSecondsLeft] = useState(redirectDelaySeconds);

    useEffect(() => {
        if (secondsLeft <= 0) {
            router.push('/');
            return;
        }

        const timer = window.setTimeout(() => {
            setSecondsLeft((prev) => prev - 1);
        }, 1000);

        return () => window.clearTimeout(timer);
    }, [secondsLeft, router]);

    const redirectMessage = i18n.redirectNotice.replace('{seconds}', String(Math.max(0, secondsLeft)));

    return (
        <div className="song-not-found-wrapper">
            <div className="song-not-found-card">
                <div className="song-not-found-illustration">
                    <SadGuitaristIllustration />
                </div>

                <Stack gap="sm" align="center" ta="center">
                    <span className="song-not-found-badge">{i18n.badge}</span>
                    <Title order={2} className="song-not-found-title">
                        {i18n.title}
                    </Title>
                    <Text className="song-not-found-description">{i18n.description}</Text>
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
                        href="/lyrics/create"
                        size="md"
                        radius="xl"
                        variant="light"
                        color="gray"
                        leftSection={<IconPlus size={18} />}
                    >
                        {i18n.createSongButton}
                    </Button>
                </Group>
            </div>
        </div>
    );
}
