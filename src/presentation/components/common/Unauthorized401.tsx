'use client';

import { I18nTypes } from '@/i18n/dictionaries';
import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconHome } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import '../../styles/pages/songs.sass';

interface Unauthorized401Props {
    i18n: I18nTypes['unauthorized'];
    redirectDelaySeconds?: number;
}

const AngryBassistIllustration = () => (
    <svg
        className="song-not-found-svg"
        viewBox="0 0 320 225"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <defs>
            <radialGradient id="ubGlow" cx="50%" cy="52%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                <stop offset="55%" stopColor="#8b5cf6" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="ubJacket" x1="115" y1="88" x2="205" y2="180" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="55%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="ubBassBody" x1="65" y1="100" x2="185" y2="175" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#e11d48" />
                <stop offset="55%" stopColor="#9f1239" />
                <stop offset="100%" stopColor="#4c0519" />
            </linearGradient>
            <linearGradient id="ubShades" x1="138" y1="54" x2="182" y2="66" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#020617" />
                <stop offset="50%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="ubTape" x1="30" y1="140" x2="290" y2="140" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#f43f5e" stopOpacity="0.55" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.15" />
            </linearGradient>
        </defs>

        {/* Backstage crimson/violet spotlight */}
        <circle cx="160" cy="115" r="104" fill="url(#ubGlow)" />
        <ellipse cx="160" cy="198" rx="118" ry="8" fill="#8b5cf6" fillOpacity="0.22" />

        {/* Backstage VIP barrier rope behind the bassist */}
        <rect x="48" y="138" width="8" height="58" rx="3" fill="#94a3b8" />
        <circle cx="52" cy="136" r="6" fill="#fbbf24" />
        <rect x="264" y="138" width="8" height="58" rx="3" fill="#94a3b8" />
        <circle cx="268" cy="136" r="6" fill="#fbbf24" />
        <path
            d="M52 146 Q160 166 268 146"
            stroke="url(#ubTape)"
            strokeWidth="6"
            strokeLinecap="round"
        />

        {/* Floating "401" & Anger Vein Symbol */}
        <g className="song-not-found-svg-float-left">
            <rect
                x="38"
                y="34"
                width="60"
                height="30"
                rx="8"
                fill="#1e1b4b"
                stroke="#f43f5e"
                strokeWidth="1.8"
            />
            <text
                x="68"
                y="54"
                textAnchor="middle"
                fill="#fda4af"
                fontSize="16"
                fontWeight="800"
                fontFamily="system-ui, sans-serif"
            >
                401
            </text>
        </g>

        {/* Comic anger mark (top-right of head) */}
        <g className="song-not-found-svg-float-right">
            <path
                d="M210 36 L216 42 L222 36 M224 44 L218 50 L224 56 M222 62 L216 56 L210 62 M208 56 L214 50 L208 44"
                stroke="#f43f5e"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </g>

        {/* Bassist Wide Stance Legs */}
        <path d="M136 164 L126 196" stroke="#0f172a" strokeWidth="14" strokeLinecap="round" />
        <path d="M184 164 L194 196" stroke="#0f172a" strokeWidth="14" strokeLinecap="round" />
        {/* Boots */}
        <rect x="114" y="190" width="22" height="9" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />
        <rect x="184" y="190" width="22" height="9" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="1.2" />

        {/* Broad Bouncer/Bassist Torso (Leather Jacket) */}
        <path
            d="M112 94 C112 78, 208 78, 208 94 L198 168 C198 174, 122 174, 122 168 Z"
            fill="url(#ubJacket)"
            stroke="#8b5cf6"
            strokeWidth="1.8"
        />
        {/* Jacket lapels & studs */}
        <path d="M142 84 L128 116 L152 118 Z" fill="#312e81" />
        <path d="M178 84 L192 116 L168 118 Z" fill="#312e81" />
        <circle cx="134" cy="108" r="2" fill="#c4b5fd" />
        <circle cx="186" cy="108" r="2" fill="#c4b5fd" />

        {/* Bassist Head */}
        <g>
            {/* Spiky / Rocker Hair */}
            <path
                d="M132 52 L126 36 L142 40 L152 26 L164 38 L178 28 L184 42 L196 38 L188 54 Z"
                fill="#1e1b4b"
                stroke="#a78bfa"
                strokeWidth="1.4"
            />
            {/* Face */}
            <circle cx="160" cy="62" r="22" fill="#fcd34d" stroke="#c4b5fd" strokeWidth="1.5" />

            {/* Deep Angry V-Eyebrows above sunglasses */}
            <path d="M140 47 L157 53" stroke="#0f172a" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M180 47 L163 53" stroke="#0f172a" strokeWidth="3.2" strokeLinecap="round" />

            {/* Cool Dark Sunglasses */}
            <rect
                x="137"
                y="53"
                width="20"
                height="13"
                rx="3"
                fill="url(#ubShades)"
                stroke="#c4b5fd"
                strokeWidth="1.4"
            />
            <rect
                x="163"
                y="53"
                width="20"
                height="13"
                rx="3"
                fill="url(#ubShades)"
                stroke="#c4b5fd"
                strokeWidth="1.4"
            />
            <line x1="157" y1="57" x2="163" y2="57" stroke="#c4b5fd" strokeWidth="2" />
            {/* Glare slash on dark lenses */}
            <line x1="141" y1="63" x2="148" y2="56" stroke="#f8fafc" strokeWidth="1.6" strokeOpacity="0.75" />
            <line x1="167" y1="63" x2="174" y2="56" stroke="#f8fafc" strokeWidth="1.6" strokeOpacity="0.75" />

            {/* Annoyed Grumpy Scowl & Goatee */}
            <path d="M150 75 Q160 69 170 75" stroke="#0f172a" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M155 79 L160 85 L165 79 Z" fill="#1e1b4b" />
        </g>

        {/* 4-String Electric Bass Guitar held horizontally as a roadblock barrier */}
        <g transform="rotate(-6 160 136)">
            {/* Bass Body (Offset Double-Cutaway Jazz/Precision Bass) */}
            <path
                d="M78 118 C58 112, 54 158, 80 162 C96 164, 108 152, 122 152 C136 152, 146 164, 162 160 C178 156, 176 142, 160 140 C150 138, 148 128, 166 122 C178 118, 174 104, 154 108 C138 112, 128 122, 114 122 C100 122, 92 120, 78 118 Z"
                fill="url(#ubBassBody)"
                stroke="#fda4af"
                strokeWidth="2"
            />
            {/* Pickguard */}
            <path
                d="M104 126 C122 124, 142 130, 148 144 C132 148, 112 146, 104 126 Z"
                fill="#f8fafc"
                fillOpacity="0.88"
            />
            {/* Bass Pickups & Bridge */}
            <rect x="82" y="128" width="6" height="22" rx="2" fill="#cbd5e1" />
            <rect x="116" y="130" width="8" height="18" rx="2" fill="#0f172a" />
            <rect x="132" y="130" width="8" height="18" rx="2" fill="#0f172a" />

            {/* Long Bass Neck & 4-Tuner Headstock */}
            <rect x="156" y="131" width="92" height="13" rx="3" fill="#fde68a" stroke="#b45309" strokeWidth="1.5" />
            {/* Frets */}
            <line x1="172" y1="131" x2="172" y2="144" stroke="#92400e" strokeWidth="1.2" />
            <line x1="188" y1="131" x2="188" y2="144" stroke="#92400e" strokeWidth="1.2" />
            <line x1="204" y1="131" x2="204" y2="144" stroke="#92400e" strokeWidth="1.2" />
            <line x1="220" y1="131" x2="220" y2="144" stroke="#92400e" strokeWidth="1.2" />
            <line x1="236" y1="131" x2="236" y2="144" stroke="#92400e" strokeWidth="1.2" />

            {/* Bass Headstock with 4 Large Tuning Pegs */}
            <path
                d="M248 127 L278 122 C284 122, 286 146, 276 148 L248 146 Z"
                fill="#be123c"
                stroke="#fda4af"
                strokeWidth="1.6"
            />
            <circle cx="256" cy="120" r="3" fill="#e2e8f0" />
            <circle cx="264" cy="119" r="3" fill="#e2e8f0" />
            <circle cx="272" cy="118" r="3" fill="#e2e8f0" />
            <circle cx="280" cy="117" r="3" fill="#e2e8f0" />

            {/* 4 Thick Bass Strings */}
            <line x1="88" y1="133" x2="248" y2="133" stroke="#e2e8f0" strokeWidth="1.6" />
            <line x1="88" y1="136" x2="248" y2="136" stroke="#e2e8f0" strokeWidth="1.5" />
            <line x1="88" y1="139" x2="248" y2="139" stroke="#e2e8f0" strokeWidth="1.3" />
            <line x1="88" y1="142" x2="248" y2="142" stroke="#e2e8f0" strokeWidth="1.2" />
        </g>

        {/* Left Hand gripping the bass neck */}
        <circle cx="192" cy="134" r="7.5" fill="#fcd34d" stroke="#0f172a" strokeWidth="1.5" />

        {/* Right Hand raised forward in a firm "STOP / HALT" gesture blocking the viewer */}
        <g transform="translate(88, 76)">
            <circle cx="18" cy="22" r="20" fill="#f43f5e" fillOpacity="0.2" />
            <rect x="10" y="14" width="16" height="18" rx="5" fill="#fcd34d" stroke="#0f172a" strokeWidth="1.6" />
            {/* 4 vertical fingers + thumb */}
            <rect x="9" y="2" width="4" height="14" rx="2" fill="#fcd34d" stroke="#0f172a" strokeWidth="1.3" />
            <rect x="14" y="0" width="4" height="16" rx="2" fill="#fcd34d" stroke="#0f172a" strokeWidth="1.3" />
            <rect x="19" y="1" width="4" height="15" rx="2" fill="#fcd34d" stroke="#0f172a" strokeWidth="1.3" />
            <rect x="24" y="4" width="4" height="12" rx="2" fill="#fcd34d" stroke="#0f172a" strokeWidth="1.3" />
            <rect
                x="25"
                y="16"
                width="10"
                height="4.5"
                rx="2"
                transform="rotate(-25 25 16)"
                fill="#fcd34d"
                stroke="#0f172a"
                strokeWidth="1.3"
            />
        </g>
    </svg>
);

export default function Unauthorized401({
    i18n,
    redirectDelaySeconds = 8,
}: Unauthorized401Props) {
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

    const redirectMessage = i18n.redirectNotice.replace(
        '{seconds}',
        String(Math.max(0, secondsLeft)),
    );

    return (
        <div className="song-not-found-wrapper">
            <div className="song-not-found-card">
                <div className="song-not-found-illustration">
                    <AngryBassistIllustration />
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
                </Group>
            </div>
        </div>
    );
}
