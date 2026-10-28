'use client';

import { I18nTypes } from '@/i18n/dictionaries';
import { Button, Group, Stack, Text, Title } from '@mantine/core';
import { IconHome, IconPlus } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import '../../styles/pages/songs.sass';

interface SongNotFoundProps {
    i18n: I18nTypes['lyrics']['notFound'];
    redirectDelaySeconds?: number;
}

const BrokenRecordIllustration = () => (
    <svg
        className='song-not-found-svg'
        viewBox='0 0 280 200'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-hidden='true'>
        <defs>
            <radialGradient id='snfGlow' cx='50%' cy='50%' r='50%'>
                <stop offset='0%' stopColor='#8b5cf6' stopOpacity='0.35' />
                <stop offset='65%' stopColor='#6d28d9' stopOpacity='0.12' />
                <stop offset='100%' stopColor='#6d28d9' stopOpacity='0' />
            </radialGradient>
            <linearGradient
                id='snfVinyl'
                x1='60'
                y1='30'
                x2='200'
                y2='170'
                gradientUnits='userSpaceOnUse'>
                <stop offset='0%' stopColor='#2e1065' />
                <stop offset='50%' stopColor='#1e1b4b' />
                <stop offset='100%' stopColor='#0f172a' />
            </linearGradient>
            <linearGradient id='snfAccent' x1='0%' y1='0%' x2='100%' y2='100%'>
                <stop offset='0%' stopColor='#c4b5fd' />
                <stop offset='50%' stopColor='#8b5cf6' />
                <stop offset='100%' stopColor='#ec4899' />
            </linearGradient>
            <linearGradient
                id='snfStaff'
                x1='0'
                y1='100'
                x2='280'
                y2='100'
                gradientUnits='userSpaceOnUse'>
                <stop offset='0%' stopColor='#a78bfa' stopOpacity='0' />
                <stop offset='25%' stopColor='#a78bfa' stopOpacity='0.35' />
                <stop offset='75%' stopColor='#f472b6' stopOpacity='0.35' />
                <stop offset='100%' stopColor='#f472b6' stopOpacity='0' />
            </linearGradient>
        </defs>

        {/* Ambient glow */}
        <circle cx='140' cy='100' r='95' fill='url(#snfGlow)' />

        {/* Musical staff wave lines */}
        <path
            d='M15 82 Q 75 62, 140 82 T 265 82'
            stroke='url(#snfStaff)'
            strokeWidth='1.5'
            strokeDasharray='4 4'
        />
        <path d='M15 100 Q 75 80, 140 100 T 265 100' stroke='url(#snfStaff)' strokeWidth='1.5' />
        <path
            d='M15 118 Q 75 98, 140 118 T 265 118'
            stroke='url(#snfStaff)'
            strokeWidth='1.5'
            strokeDasharray='4 4'
        />

        {/* Vinyl disc */}
        <circle
            cx='140'
            cy='100'
            r='64'
            fill='url(#snfVinyl)'
            stroke='url(#snfAccent)'
            strokeWidth='2.2'
        />
        <circle
            cx='140'
            cy='100'
            r='52'
            stroke='#a78bfa'
            strokeOpacity='0.22'
            strokeWidth='1'
            strokeDasharray='8 6'
        />
        <circle
            cx='140'
            cy='100'
            r='40'
            stroke='#a78bfa'
            strokeOpacity='0.3'
            strokeWidth='1'
            strokeDasharray='12 5'
        />
        <circle cx='140' cy='100' r='28' stroke='#f472b6' strokeOpacity='0.35' strokeWidth='1.2' />

        {/* Vinyl center label */}
        <circle cx='140' cy='100' r='19' fill='url(#snfAccent)' />
        <circle cx='140' cy='100' r='6' fill='#0f172a' />

        {/* Crack / mute lightning across the record */}
        <path
            d='M108 50 L132 82 L122 92 L152 122 L144 130 L170 154'
            stroke='#f472b6'
            strokeWidth='2.8'
            strokeLinecap='round'
            strokeLinejoin='round'
        />

        {/* Floating musical notes & question mark */}
        <g className='song-not-found-svg-float-left'>
            <path
                d='M52 72 V46 L68 42 V68'
                stroke='#c4b5fd'
                strokeWidth='2.2'
                strokeLinecap='round'
                strokeLinejoin='round'
            />
            <ellipse cx='48' cy='73' rx='5.5' ry='4' transform='rotate(-18 48 73)' fill='#c4b5fd' />
            <ellipse cx='64' cy='69' rx='5.5' ry='4' transform='rotate(-18 64 69)' fill='#c4b5fd' />
        </g>

        <g className='song-not-found-svg-float-right'>
            <circle cx='222' cy='62' r='15' fill='#1e1b4b' stroke='#f472b6' strokeWidth='1.8' />
            <text
                x='222'
                y='68'
                textAnchor='middle'
                fill='#f9a8d4'
                fontSize='17'
                fontWeight='700'
                fontFamily='system-ui, sans-serif'>
                ?
            </text>
        </g>

        {/* Sparkle accents */}
        <circle cx='72' cy='142' r='3' fill='#a78bfa' opacity='0.7' />
        <circle cx='212' cy='134' r='3.5' fill='#f472b6' opacity='0.75' />
        <circle cx='235' cy='98' r='2.2' fill='#c4b5fd' opacity='0.6' />
        <circle cx='44' cy='112' r='2.2' fill='#f472b6' opacity='0.6' />
    </svg>
);

export default function SongNotFound({ i18n, redirectDelaySeconds = 15 }: SongNotFoundProps) {
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
        <div className='song-not-found-wrapper'>
            <div className='song-not-found-card'>
                <div className='song-not-found-illustration'>
                    <BrokenRecordIllustration />
                </div>

                <Stack gap='sm' align='center' ta='center'>
                    <span className='song-not-found-badge'>{i18n.badge}</span>
                    <Title order={2} className='song-not-found-title'>
                        {i18n.title}
                    </Title>
                    <Text className='song-not-found-description'>{i18n.description}</Text>
                </Stack>

                <div className='song-not-found-countdown'>
                    <span className='song-not-found-pulse' />
                    <Text size='sm' fw={500}>
                        {redirectMessage}
                    </Text>
                </div>

                <Group justify='center' gap='md' wrap='wrap' mt='xs'>
                    <Button
                        component={Link}
                        href='/'
                        size='md'
                        radius='xl'
                        color='violet'
                        leftSection={<IconHome size={18} />}>
                        {i18n.goHomeButton}
                    </Button>
                    <Button
                        component={Link}
                        href='/lyrics/create'
                        size='md'
                        radius='xl'
                        variant='light'
                        color='gray'
                        leftSection={<IconPlus size={18} />}>
                        {i18n.createSongButton}
                    </Button>
                </Group>
            </div>
        </div>
    );
}
