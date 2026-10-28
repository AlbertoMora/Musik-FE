'use client';

import { IRepertoireDTO } from '@/domain/repertoires/repertoire-gateway';
import { ISongRes } from '@/domain/songs/song-gateway';
import { I18nTypes } from '@/i18n/dictionaries';
import { IKey, ISongModel, ISongPermission } from '@/infrastructure/models/SongModel';
import SongText from '@/presentation/components/songs/SongText/SongText';
import { extractBracedValues } from '@/utils/text-utils';
import { ActionIcon, Badge, Button, Divider, Group, Stack, Switch, Text, Title, Tooltip } from '@mantine/core';
import {
    IconArrowLeft,
    IconChevronLeft,
    IconChevronRight,
    IconExternalLink,
    IconHeadphones,
    IconHeadphonesOff,
    IconLayoutSidebarRightCollapse,
    IconLayoutSidebarRightExpand,
    IconMaximize,
    IconMinimize,
    IconMusic,
    IconPlaylist,
    IconTool,
} from '@tabler/icons-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface RepertoireViewerProps {
    repertoire: IRepertoireDTO;
    songs: ISongRes[];
    permissions: ISongPermission[] | null;
    lyricsI18n: I18nTypes['lyrics']['text'];
    viewI18n: I18nTypes['repertoires']['view'];
}

const mapSongResToModel = (
    song: ISongRes,
    permissions: ISongPermission[] | null,
): ISongModel => ({
    id: song.id,
    title: song.name,
    artist: song.artist_name ?? '',
    postedBy: song.posted_by ?? '',
    forkOf: song.fork_of ?? '',
    genre: song.genre ?? '',
    bpm: song.bpm ?? 0,
    songKey: song.key ?? '',
    averageScore: song.avg_rate ?? 0,
    sampleUri: song.sample_url ?? null,
    lyrics: song.lyrics_text ?? '',
    chords: extractBracedValues(song.lyrics_text ?? '').map(
        c =>
            ({
                position: c.position,
                key: c.value,
                line: c.line,
            }) as IKey,
    ),
    permissions,
});

const SWIPE_THRESHOLD_PX = 65;

export default function RepertoireViewer({
    repertoire,
    songs,
    permissions,
    lyricsI18n,
    viewI18n,
}: RepertoireViewerProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [showPlayer, setShowPlayer] = useState(true);
    const [showTools, setShowTools] = useState(true);
    const [focusMode, setFocusMode] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Book-like drag / swipe state
    const dragStartXRef = useRef<number | null>(null);
    const dragStartYRef = useRef<number | null>(null);
    const [dragOffsetX, setDragOffsetX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const goPrev = useCallback(() => {
        setActiveIndex(i => Math.max(0, i - 1));
    }, []);

    const goNext = useCallback(() => {
        setActiveIndex(i => Math.min(songs.length - 1, i + 1));
    }, [songs.length]);

    // Keyboard navigation (Left / Right arrows + Escape for focus mode)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                goPrev();
            } else if (e.key === 'ArrowRight') {
                goNext();
            } else if (e.key === 'Escape' && focusMode) {
                setFocusMode(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [goPrev, goNext, focusMode]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        // Ignore clicks on buttons, links, inputs, audio controls
        const target = e.target as HTMLElement;
        if (target.closest('button, a, input, audio, .mantine-Slider-root')) {
            return;
        }
        dragStartXRef.current = e.clientX;
        dragStartYRef.current = e.clientY;
        setIsDragging(true);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDragging || dragStartXRef.current === null || dragStartYRef.current === null) return;
        const deltaX = e.clientX - dragStartXRef.current;
        const deltaY = e.clientY - dragStartYRef.current;

        // Only track horizontal book-swipe if horizontal movement dominates
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            const clamped = Math.max(-180, Math.min(180, deltaX));
            setDragOffsetX(clamped);
        }
    };

    const finishDrag = () => {
        if (!isDragging) return;
        if (dragOffsetX <= -SWIPE_THRESHOLD_PX && activeIndex < songs.length - 1) {
            goNext();
        } else if (dragOffsetX >= SWIPE_THRESHOLD_PX && activeIndex > 0) {
            goPrev();
        }
        dragStartXRef.current = null;
        dragStartYRef.current = null;
        setDragOffsetX(0);
        setIsDragging(false);
    };

    const activeSongModel = useMemo(() => {
        if (!songs.length) return null;
        const current = songs[Math.min(activeIndex, songs.length - 1)];
        return mapSongResToModel(current, permissions);
    }, [songs, activeIndex, permissions]);

    const activeRawSong = songs[Math.min(activeIndex, songs.length - 1)];

    return (
        <div className={`repertoire-view-layout ${focusMode ? 'is-focus-mode' : ''}`}>
            {/* Focus Mode Top Floating Pill & Side Arrows */}
            {focusMode && (
                <>
                    <div className="repertoire-focus-topbar">
                        <Badge color="violet" variant="filled" radius="xl">
                            {activeIndex + 1} / {songs.length}
                        </Badge>
                        <Text size="sm" fw={600} c="white" lineClamp={1}>
                            {activeRawSong?.name}
                            {activeRawSong?.artist_name ? ` — ${activeRawSong.artist_name}` : ''}
                        </Text>
                        <Text size="xs" c="dimmed" visibleFrom="md">
                            ({viewI18n.focusSwipeHint})
                        </Text>
                        <Button
                            size="compact-xs"
                            radius="xl"
                            color="red"
                            variant="light"
                            leftSection={<IconMinimize size={14} />}
                            onClick={() => setFocusMode(false)}
                        >
                            {viewI18n.focusModeExit}
                        </Button>
                    </div>

                    <button
                        type="button"
                        aria-label={viewI18n.previousSong}
                        className="repertoire-focus-arrow repertoire-focus-arrow--left"
                        disabled={activeIndex <= 0}
                        onClick={goPrev}
                    >
                        <IconChevronLeft size={26} />
                    </button>

                    <button
                        type="button"
                        aria-label={viewI18n.nextSong}
                        className="repertoire-focus-arrow repertoire-focus-arrow--right"
                        disabled={activeIndex >= songs.length - 1}
                        onClick={goNext}
                    >
                        <IconChevronRight size={26} />
                    </button>
                </>
            )}

            {/* Main Lyrics Stage (Supports Book-Like Drag / Swipe Left & Right) */}
            <div
                className={`repertoire-main-stage ${isDragging ? 'is-dragging' : ''}`}
                style={{
                    transform:
                        dragOffsetX !== 0
                            ? `translateX(${dragOffsetX * 0.45}px) rotateY(${dragOffsetX * -0.03}deg)`
                            : undefined,
                }}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
                onPointerLeave={finishDrag}
            >
                {activeSongModel ? (
                    <SongText
                        key={activeSongModel.id}
                        i18n={lyricsI18n}
                        showMusicPlayer={showPlayer}
                        showSongTools={showTools}
                        focusMode={focusMode}
                        {...activeSongModel}
                    />
                ) : (
                    <div className="create-repertoire-container">
                        <div className="repertoire-empty-box">
                            <IconMusic size={38} stroke={1.5} />
                            <Text>{viewI18n.emptySongs}</Text>
                        </div>
                    </div>
                )}
            </div>

            {/* Right Sidebar Menu (Hidden in Focus Mode) */}
            {!focusMode && (
                <aside
                    className={`repertoire-right-sidebar ${
                        sidebarCollapsed ? 'is-collapsed' : ''
                    }`}
                >
                    {sidebarCollapsed ? (
                        <Stack align="center" gap="md">
                            <Tooltip label={viewI18n.toggleSidebar} position="left">
                                <ActionIcon
                                    variant="light"
                                    color="violet"
                                    size="lg"
                                    radius="xl"
                                    onClick={() => setSidebarCollapsed(false)}
                                >
                                    <IconLayoutSidebarRightExpand size={20} />
                                </ActionIcon>
                            </Tooltip>

                            <Tooltip label={viewI18n.focusModeEnter} position="left">
                                <ActionIcon
                                    variant="light"
                                    color="grape"
                                    size="lg"
                                    radius="xl"
                                    onClick={() => setFocusMode(true)}
                                >
                                    <IconMaximize size={18} />
                                </ActionIcon>
                            </Tooltip>

                            <Tooltip
                                label={showPlayer ? viewI18n.hidePlayer : viewI18n.showPlayer}
                                position="left"
                            >
                                <ActionIcon
                                    variant="subtle"
                                    color={showPlayer ? 'violet' : 'gray'}
                                    size="lg"
                                    radius="xl"
                                    onClick={() => setShowPlayer(v => !v)}
                                >
                                    {showPlayer ? (
                                        <IconHeadphones size={18} />
                                    ) : (
                                        <IconHeadphonesOff size={18} />
                                    )}
                                </ActionIcon>
                            </Tooltip>

                            <Tooltip
                                label={showTools ? viewI18n.hideTools : viewI18n.showTools}
                                position="left"
                            >
                                <ActionIcon
                                    variant="subtle"
                                    color={showTools ? 'violet' : 'gray'}
                                    size="lg"
                                    radius="xl"
                                    onClick={() => setShowTools(v => !v)}
                                >
                                    <IconTool size={18} />
                                </ActionIcon>
                            </Tooltip>

                            <Divider w="100%" />

                            <ActionIcon
                                variant="default"
                                radius="xl"
                                disabled={activeIndex <= 0}
                                onClick={goPrev}
                            >
                                <IconChevronLeft size={16} />
                            </ActionIcon>
                            <Badge color="violet" variant="light" size="sm">
                                {activeIndex + 1}/{songs.length}
                            </Badge>
                            <ActionIcon
                                variant="filled"
                                color="violet"
                                radius="xl"
                                disabled={activeIndex >= songs.length - 1}
                                onClick={goNext}
                            >
                                <IconChevronRight size={16} />
                            </ActionIcon>
                        </Stack>
                    ) : (
                        <>
                            {/* Header & Collapse button */}
                            <Group justify="space-between" align="flex-start" wrap="nowrap">
                                <div style={{ minWidth: 0 }}>
                                    <Button
                                        component={Link}
                                        href="/my-repertoires"
                                        variant="subtle"
                                        color="gray"
                                        size="compact-xs"
                                        radius="xl"
                                        leftSection={<IconArrowLeft size={14} />}
                                        mb={4}
                                    >
                                        {viewI18n.backToMyRepertoires}
                                    </Button>
                                    <Group gap={6} wrap="nowrap">
                                        <IconPlaylist size={20} color="#a78bfa" />
                                        <Title order={4} lineClamp={1}>
                                            {repertoire.name}
                                        </Title>
                                    </Group>
                                </div>

                                <Tooltip label={viewI18n.toggleSidebar}>
                                    <ActionIcon
                                        variant="subtle"
                                        color="gray"
                                        radius="xl"
                                        onClick={() => setSidebarCollapsed(true)}
                                    >
                                        <IconLayoutSidebarRightCollapse size={19} />
                                    </ActionIcon>
                                </Tooltip>
                            </Group>

                            {/* Prev / Next Navigation */}
                            {songs.length > 0 && (
                                <Group grow gap="xs">
                                    <Button
                                        size="xs"
                                        radius="xl"
                                        variant="default"
                                        leftSection={<IconChevronLeft size={15} />}
                                        disabled={activeIndex <= 0}
                                        onClick={goPrev}
                                    >
                                        {viewI18n.previousSong}
                                    </Button>
                                    <Button
                                        size="xs"
                                        radius="xl"
                                        color="violet"
                                        rightSection={<IconChevronRight size={15} />}
                                        disabled={activeIndex >= songs.length - 1}
                                        onClick={goNext}
                                    >
                                        {viewI18n.nextSong}
                                    </Button>
                                </Group>
                            )}

                            {/* Controls: Recording Toggle & Focus Mode */}
                            <Stack gap="xs">
                                <Switch
                                    checked={showPlayer}
                                    onChange={e => setShowPlayer(e.currentTarget.checked)}
                                    color="violet"
                                    size="sm"
                                    thumbIcon={
                                        showPlayer ? (
                                            <IconHeadphones size={11} color="#7c3aed" />
                                        ) : (
                                            <IconHeadphonesOff size={11} color="#64748b" />
                                        )
                                    }
                                    label={showPlayer ? viewI18n.hidePlayer : viewI18n.showPlayer}
                                />

                                <Switch
                                    checked={showTools}
                                    onChange={e => setShowTools(e.currentTarget.checked)}
                                    color="violet"
                                    size="sm"
                                    thumbIcon={
                                        <IconTool
                                            size={11}
                                            color={showTools ? '#7c3aed' : '#64748b'}
                                        />
                                    }
                                    label={showTools ? viewI18n.hideTools : viewI18n.showTools}
                                />

                                <Button
                                    size="xs"
                                    radius="xl"
                                    variant="gradient"
                                    gradient={{ from: 'violet', to: 'grape', deg: 145 }}
                                    leftSection={<IconMaximize size={15} />}
                                    onClick={() => setFocusMode(true)}
                                    disabled={songs.length === 0}
                                >
                                    {viewI18n.focusModeEnter}
                                </Button>

                                {activeRawSong?.slug && (
                                    <Button
                                        component={Link}
                                        href={`/lyrics/${activeRawSong.slug}`}
                                        variant="subtle"
                                        color="violet"
                                        size="xs"
                                        radius="xl"
                                        rightSection={<IconExternalLink size={14} />}
                                    >
                                        {viewI18n.openIndividualSong}
                                    </Button>
                                )}
                            </Stack>

                            <Divider />

                            {/* Ordered Setlist */}
                            <Group justify="space-between" align="center">
                                <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                                    {viewI18n.songsInRepertoire}
                                </Text>
                                <Badge color="violet" variant="light" size="sm" radius="xl">
                                    {activeIndex + 1} / {songs.length}
                                </Badge>
                            </Group>

                            <div className="repertoire-sidebar-songs">
                                {songs.map((song, idx) => (
                                    <button
                                        key={song.id}
                                        type="button"
                                        onClick={() => setActiveIndex(idx)}
                                        className={`repertoire-sidebar-song-item ${
                                            idx === activeIndex ? 'is-active' : ''
                                        }`}
                                    >
                                        <Group
                                            gap={8}
                                            wrap="nowrap"
                                            style={{ minWidth: 0, flex: 1 }}
                                        >
                                            <span style={{ opacity: 0.8, fontWeight: 700 }}>
                                                {idx + 1}.
                                            </span>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <Text size="sm" fw={600} truncate>
                                                    {song.name}
                                                </Text>
                                                <Text
                                                    size="xs"
                                                    style={{
                                                        opacity: idx === activeIndex ? 0.85 : 0.65,
                                                    }}
                                                    truncate
                                                >
                                                    {song.artist_name}
                                                </Text>
                                            </div>
                                        </Group>
                                        {song.key && (
                                            <Badge
                                                size="xs"
                                                variant={idx === activeIndex ? 'filled' : 'light'}
                                                color={idx === activeIndex ? 'dark' : 'violet'}
                                            >
                                                {song.key}
                                            </Badge>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </aside>
            )}
        </div>
    );
}
