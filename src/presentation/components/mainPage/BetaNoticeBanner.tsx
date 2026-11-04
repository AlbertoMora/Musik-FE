'use client';

import React, { useEffect, useState } from 'react';
import { ActionIcon, Badge, Group, Paper, Stack, Text, Transition } from '@mantine/core';
import { IconHeartHandshake, IconSparkles, IconX } from '@tabler/icons-react';
import { I18nTypes } from '@/i18n/dictionaries';

const STORAGE_KEY = 'sonnetia_beta_banner_dismissed';

interface BetaNoticeBannerProps {
    i18n?: I18nTypes['main']['betaNotice'];
}

export const BetaNoticeBanner: React.FC<BetaNoticeBannerProps> = ({ i18n }) => {
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        setMounted(true);
        try {
            const isDismissed = localStorage.getItem(STORAGE_KEY) === 'true';
            if (!isDismissed) {
                setVisible(true);
            }
        } catch {
            setVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setVisible(false);
        try {
            localStorage.setItem(STORAGE_KEY, 'true');
        } catch {
            // ignore localStorage errors
        }
    };

    if (!mounted || !visible || !i18n) return null;

    return (
        <Transition mounted={visible} transition='fade' duration={250} timingFunction='ease'>
            {styles => (
                <Paper
                    style={{
                        ...styles,
                        width: 'min(100%, 54rem)',
                        background:
                            'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(139, 92, 246, 0.12) 50%, rgba(15, 23, 42, 0.7) 100%)',
                        border: '1px solid rgba(239, 68, 68, 0.28)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.18)',
                        padding: '1.15rem 1.35rem',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                    <Group align='flex-start' justify='space-between' wrap='nowrap' gap='md'>
                        <Group align='flex-start' gap='md' wrap='nowrap' style={{ flex: 1 }}>
                            <div
                                style={{
                                    width: 44,
                                    height: 44,
                                    minWidth: 44,
                                    borderRadius: 12,
                                    background: 'rgba(239, 68, 68, 0.18)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#ef4444',
                                    boxShadow: 'inset 0 0 12px rgba(239, 68, 68, 0.15)',
                                }}>
                                <IconHeartHandshake size={26} stroke={1.8} />
                            </div>

                            <Stack gap={6} style={{ flex: 1 }}>
                                <Group gap='xs'>
                                    <Badge
                                        variant='gradient'
                                        gradient={{ from: 'red', to: 'grape', deg: 90 }}
                                        size='sm'
                                        radius='xl'
                                        leftSection={<IconSparkles size={11} />}>
                                        {i18n.badge}
                                    </Badge>
                                    <Text size='sm' fw={700}>
                                        {i18n.title}
                                    </Text>
                                </Group>
                                <Text
                                    size='xs'
                                    lh={1.6}
                                    c='dimmed'
                                    style={{
                                        color: 'var(--text-secondary, rgba(255, 255, 255, 0.82))',
                                    }}>
                                    {i18n.message}
                                </Text>
                            </Stack>
                        </Group>

                        <ActionIcon
                            variant='subtle'
                            color='gray'
                            size='sm'
                            radius='xl'
                            onClick={handleDismiss}
                            aria-label={i18n.dismissAria}
                            style={{
                                opacity: 0.75,
                                transition: 'opacity 0.2s',
                                '&:hover': { opacity: 1 },
                            }}>
                            <IconX size={16} />
                        </ActionIcon>
                    </Group>
                </Paper>
            )}
        </Transition>
    );
};
