'use client';

import { IRepertoireDTO, IRepertoireEditorDTO } from '@/domain/repertoires/repertoire-gateway';
import { ISongRes } from '@/domain/songs/song-gateway';
import { I18nTypes } from '@/i18n/dictionaries';
import {
    addRepertoireEditorAction,
    generateRepertoireEditLinkAction,
    removeRepertoireEditorAction,
    revokeRepertoireEditLinkAction,
    searchRepertoireUsersAction,
    updateRepertoireAction,
} from '@/infrastructure/adapters/repertoires/repertoires-actions';
import { getSongsByNameAction } from '@/infrastructure/adapters/songs/songs-actions';
import { IKey, ISongModel, ISongPermission } from '@/infrastructure/models/SongModel';
import SongText from '@/presentation/components/songs/SongText/SongText';
import {
    NotificationService,
    NotificationTypes,
} from '@/presentation/services/notification-service';
import { exportRepertoireToLetterPdf } from '@/utils/pdf-export';
import { extractBracedValues } from '@/utils/text-utils';
import {
    ActionIcon,
    Badge,
    Button,
    Divider,
    Group,
    Loader,
    Modal,
    Stack,
    Switch,
    Text,
    TextInput,
    Title,
    Tooltip,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import {
    IconArrowDown,
    IconArrowLeft,
    IconArrowUp,
    IconCheck,
    IconChevronLeft,
    IconChevronRight,
    IconCopy,
    IconDeviceFloppy,
    IconEdit,
    IconExternalLink,
    IconFileTypePdf,
    IconHeadphones,
    IconHeadphonesOff,
    IconLayoutSidebarRightCollapse,
    IconLayoutSidebarRightExpand,
    IconLink,
    IconLinkOff,
    IconMaximize,
    IconMinimize,
    IconMusic,
    IconPlaylist,
    IconPlaylistAdd,
    IconPlus,
    IconRefresh,
    IconSearch,
    IconShare,
    IconTool,
    IconTrash,
    IconUserPlus,
    IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface RepertoireViewerProps {
    repertoire: IRepertoireDTO;
    repertoireSlug?: string;
    editToken?: string;
    songs: ISongRes[];
    editors?: IRepertoireEditorDTO[];
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
    repertoireSlug,
    editToken,
    songs: initialSongs,
    editors: initialEditors = [],
    permissions,
    lyricsI18n,
    viewI18n,
}: RepertoireViewerProps) {
    const [songsList, setSongsList] = useState<ISongRes[]>(initialSongs);
    const [activeIndex, setActiveIndex] = useState(0);
    const [showPlayer, setShowPlayer] = useState(true);
    const [showTools, setShowTools] = useState(true);
    const [focusMode, setFocusMode] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Edit songs modal & state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [draftSongs, setDraftSongs] = useState<ISongRes[]>(initialSongs);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ISongRes[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isSavingRepertoire, setIsSavingRepertoire] = useState(false);

    // Share edit link modal & state
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [activeEditLinkToken, setActiveEditLinkToken] = useState<string | null>(
        repertoire.editLinkToken ?? null,
    );
    const [isManagingLink, setIsManagingLink] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    // Editors modal & state
    const [editorsModalOpen, setEditorsModalOpen] = useState(false);
    const [editorsList, setEditorsList] = useState<IRepertoireEditorDTO[]>(initialEditors);
    const [editorSearchQuery, setEditorSearchQuery] = useState('');
    const [editorSearchResults, setEditorSearchResults] = useState<IRepertoireEditorDTO[]>([]);
    const [isSearchingUsers, setIsSearchingUsers] = useState(false);
    const [isManagingEditors, setIsManagingEditors] = useState(false);

    useEffect(() => {
        setSongsList(initialSongs);
    }, [initialSongs]);

    useEffect(() => {
        setEditorsList(initialEditors);
    }, [initialEditors]);

    useEffect(() => {
        setActiveEditLinkToken(repertoire.editLinkToken ?? null);
    }, [repertoire.editLinkToken]);

    const canEditRepertoire = useMemo(
        () =>
            permissions?.some(p => p.correlationId === 'can_edit' && p.allowed) ?? false,
        [permissions],
    );

    const canShareRepertoire = useMemo(
        () =>
            permissions?.some(p => p.correlationId === 'can_share' && p.allowed) ?? false,
        [permissions],
    );

    const isEditingViaSharedLink = useMemo(
        () => Boolean(editToken) && canEditRepertoire && !canShareRepertoire,
        [editToken, canEditRepertoire, canShareRepertoire],
    );

    const shareableEditUrl = useMemo(() => {
        if (!activeEditLinkToken) return '';
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        const targetSlug = repertoireSlug || repertoire.slug || repertoire._id;
        return `${origin}/repertoires/${targetSlug}?editToken=${encodeURIComponent(
            activeEditLinkToken,
        )}`;
    }, [activeEditLinkToken, repertoireSlug, repertoire.slug, repertoire._id]);

    const draftSongIdsSet = useMemo(
        () => new Set(draftSongs.map(s => s.id)),
        [draftSongs],
    );

    const editorIdsSet = useMemo(
        () => new Set(editorsList.map(e => e.id)),
        [editorsList],
    );

    // Book-like drag / swipe state
    const dragStartXRef = useRef<number | null>(null);
    const dragStartYRef = useRef<number | null>(null);
    const [dragOffsetX, setDragOffsetX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);

    const goPrev = useCallback(() => {
        setActiveIndex(i => Math.max(0, i - 1));
    }, []);

    const goNext = useCallback(() => {
        setActiveIndex(i => Math.min(Math.max(0, songsList.length - 1), i + 1));
    }, [songsList.length]);

    // Keyboard navigation (Left / Right arrows + Escape for focus mode)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (editModalOpen || shareModalOpen || editorsModalOpen) return;
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
    }, [goPrev, goNext, focusMode, editModalOpen, shareModalOpen, editorsModalOpen]);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
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

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            const clamped = Math.max(-180, Math.min(180, deltaX));
            setDragOffsetX(clamped);
        }
    };

    const finishDrag = () => {
        if (!isDragging) return;
        if (dragOffsetX <= -SWIPE_THRESHOLD_PX && activeIndex < songsList.length - 1) {
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
        if (!songsList.length) return null;
        const current = songsList[Math.min(activeIndex, songsList.length - 1)];
        return mapSongResToModel(current, permissions);
    }, [songsList, activeIndex, permissions]);

    const activeRawSong = songsList[Math.min(activeIndex, Math.max(0, songsList.length - 1))];

    const handleExportRepertoirePdf = useCallback(() => {
        if (!songsList.length) return;
        exportRepertoireToLetterPdf({
            repertoireName: repertoire.name,
            songs: songsList.map(s => {
                const mapped = mapSongResToModel(s, permissions);
                return {
                    title: mapped.title,
                    artist: mapped.artist,
                    postedBy: mapped.postedBy,
                    forkOf: mapped.forkOf,
                    genre: mapped.genre,
                    bpm: mapped.bpm,
                    songKey: mapped.songKey,
                    lyrics: mapped.lyrics,
                    chords: mapped.chords,
                    labels: lyricsI18n.labels,
                };
            }),
        });
    }, [songsList, repertoire.name, permissions, lyricsI18n.labels]);

    const persistUpdatedSongs = async (nextSongs: ISongRes[]) => {
        setIsSavingRepertoire(true);
        const lyricIds = nextSongs.map(s => s.id);
        const res = await updateRepertoireAction(repertoire._id, {
            lyrics: lyricIds,
            linkToken: editToken,
        });
        setIsSavingRepertoire(false);

        if (!res.success) {
            NotificationService.showMessage(
                viewI18n.updateError,
                NotificationTypes.error,
                repertoire.name,
            );
            return false;
        }

        setSongsList(nextSongs);
        setActiveIndex(prev => Math.min(prev, Math.max(0, nextSongs.length - 1)));
        NotificationService.showMessage(
            viewI18n.updateSuccess,
            NotificationTypes.ok,
            repertoire.name,
        );
        return true;
    };

    const handleGenerateEditLink = async () => {
        if (!canShareRepertoire || isManagingLink) return;
        setIsManagingLink(true);
        const res = await generateRepertoireEditLinkAction(repertoire._id);
        setIsManagingLink(false);

        if (!res.success || !res.data?.editLinkToken) {
            NotificationService.showMessage(
                viewI18n.linkActionError,
                NotificationTypes.error,
                repertoire.name,
            );
            return;
        }

        setActiveEditLinkToken(res.data.editLinkToken);
        setCopiedLink(false);
        NotificationService.showMessage(
            viewI18n.linkGeneratedSuccess,
            NotificationTypes.ok,
            repertoire.name,
        );
    };

    const handleRevokeEditLink = async () => {
        if (!canShareRepertoire || isManagingLink) return;
        setIsManagingLink(true);
        const res = await revokeRepertoireEditLinkAction(repertoire._id);
        setIsManagingLink(false);

        if (!res.success) {
            NotificationService.showMessage(
                viewI18n.linkActionError,
                NotificationTypes.error,
                repertoire.name,
            );
            return;
        }

        setActiveEditLinkToken(null);
        setCopiedLink(false);
        NotificationService.showMessage(
            viewI18n.linkRevokedSuccess,
            NotificationTypes.ok,
            repertoire.name,
        );
    };

    const handleCopyEditLink = async () => {
        if (!shareableEditUrl) return;
        try {
            await navigator.clipboard.writeText(shareableEditUrl);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2200);
        } catch {
            // Ignore clipboard errors
        }
    };

    const performEditorUserSearch = useDebouncedCallback(async (query: string) => {
        const trimmed = query.trim();
        if (trimmed.length < 2) {
            setEditorSearchResults([]);
            setIsSearchingUsers(false);
            return;
        }
        setIsSearchingUsers(true);
        const res = await searchRepertoireUsersAction(repertoire._id, trimmed);
        if (res?.success && res.data?.users) {
            setEditorSearchResults(res.data.users);
        } else {
            setEditorSearchResults([]);
        }
        setIsSearchingUsers(false);
    }, 320);

    const handleEditorSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.currentTarget.value;
        setEditorSearchQuery(val);
        if (val.trim().length >= 2) {
            setIsSearchingUsers(true);
        }
        performEditorUserSearch(val);
    };

    const handleAddEditor = async (payload: { userId?: string; identifier?: string }) => {
        if (!canShareRepertoire || isManagingEditors) return;
        setIsManagingEditors(true);
        const res = await addRepertoireEditorAction(repertoire._id, payload);
        setIsManagingEditors(false);

        if (!res.success || !res.data?.editors) {
            NotificationService.showMessage(
                viewI18n.editorActionError,
                NotificationTypes.error,
                repertoire.name,
            );
            return;
        }

        setEditorsList(res.data.editors);
        NotificationService.showMessage(
            viewI18n.editorAddedSuccess,
            NotificationTypes.ok,
            repertoire.name,
        );
    };

    const handleRemoveEditor = async (editorUserId: string) => {
        if (!canShareRepertoire || isManagingEditors) return;
        setIsManagingEditors(true);
        const res = await removeRepertoireEditorAction(repertoire._id, editorUserId);
        setIsManagingEditors(false);

        if (!res.success || !res.data?.editors) {
            NotificationService.showMessage(
                viewI18n.editorActionError,
                NotificationTypes.error,
                repertoire.name,
            );
            return;
        }

        setEditorsList(res.data.editors);
        NotificationService.showMessage(
            viewI18n.editorRemovedSuccess,
            NotificationTypes.ok,
            repertoire.name,
        );
    };

    const openEditorsModal = () => {
        setEditorSearchQuery('');
        setEditorSearchResults([]);
        setEditorsModalOpen(true);
    };

    const handleQuickRemoveSongFromSidebar = async (
        e: React.MouseEvent,
        songId: string,
    ) => {
        e.stopPropagation();
        if (!canEditRepertoire || isSavingRepertoire) return;
        const nextSongs = songsList.filter(s => s.id !== songId);
        await persistUpdatedSongs(nextSongs);
    };

    const openEditModal = () => {
        setDraftSongs(songsList);
        setSearchQuery('');
        setSearchResults([]);
        setEditModalOpen(true);
    };

    const performSongSearch = useDebouncedCallback(async (query: string) => {
        const trimmed = query.trim();
        if (trimmed.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        const res = await getSongsByNameAction(trimmed, 10, 0);
        if (res?.success && res.data?.songs) {
            setSearchResults(res.data.songs);
        } else {
            setSearchResults([]);
        }
        setIsSearching(false);
    }, 320);

    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.currentTarget.value;
        setSearchQuery(val);
        if (val.trim().length >= 2) {
            setIsSearching(true);
        }
        performSongSearch(val);
    };

    const handleAddDraftSong = (song: ISongRes) => {
        if (draftSongIdsSet.has(song.id)) return;
        setDraftSongs(prev => [...prev, song]);
    };

    const handleRemoveDraftSong = (songId: string) => {
        setDraftSongs(prev => prev.filter(s => s.id !== songId));
    };

    const handleMoveDraftSong = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= draftSongs.length) return;
        setDraftSongs(prev => {
            const copy = [...prev];
            const [moved] = copy.splice(index, 1);
            copy.splice(targetIndex, 0, moved);
            return copy;
        });
    };

    const handleSaveModalChanges = async () => {
        const ok = await persistUpdatedSongs(draftSongs);
        if (ok) {
            setEditModalOpen(false);
        }
    };

    return (
        <div className={`repertoire-view-layout ${focusMode ? 'is-focus-mode' : ''}`}>
            {/* Focus Mode Top Floating Pill & Side Arrows */}
            {focusMode && (
                <>
                    <div className="repertoire-focus-topbar">
                        <Badge color="violet" variant="filled" radius="xl">
                            {songsList.length > 0 ? activeIndex + 1 : 0} / {songsList.length}
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
                        disabled={activeIndex >= songsList.length - 1}
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
                        showComments={false}
                        focusMode={focusMode}
                        {...activeSongModel}
                    />
                ) : (
                    <div className="create-repertoire-container">
                        <div className="repertoire-empty-box">
                            <IconMusic size={38} stroke={1.5} />
                            <Text>{viewI18n.emptySongs}</Text>
                            {canEditRepertoire && (
                                <Button
                                    size="xs"
                                    radius="xl"
                                    color="violet"
                                    leftSection={<IconPlaylistAdd size={16} />}
                                    onClick={openEditModal}
                                >
                                    {viewI18n.editSongsButton}
                                </Button>
                            )}
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

                            <Tooltip label={viewI18n.exportRepertoirePdf} position="left">
                                <ActionIcon
                                    variant="light"
                                    color="violet"
                                    size="lg"
                                    radius="xl"
                                    disabled={songsList.length === 0}
                                    onClick={handleExportRepertoirePdf}
                                >
                                    <IconFileTypePdf size={18} />
                                </ActionIcon>
                            </Tooltip>

                            {canEditRepertoire && (
                                <Tooltip label={viewI18n.editSongsButton} position="left">
                                    <ActionIcon
                                        variant="light"
                                        color="teal"
                                        size="lg"
                                        radius="xl"
                                        onClick={openEditModal}
                                    >
                                        <IconEdit size={18} />
                                    </ActionIcon>
                                </Tooltip>
                            )}

                            {canShareRepertoire && (
                                <Tooltip label={viewI18n.manageEditorsButton} position="left">
                                    <ActionIcon
                                        variant="light"
                                        color="indigo"
                                        size="lg"
                                        radius="xl"
                                        onClick={openEditorsModal}
                                    >
                                        <IconUsers size={18} />
                                    </ActionIcon>
                                </Tooltip>
                            )}

                            {canShareRepertoire && (
                                <Tooltip label={viewI18n.shareEditLinkButton} position="left">
                                    <ActionIcon
                                        variant="light"
                                        color="cyan"
                                        size="lg"
                                        radius="xl"
                                        onClick={() => setShareModalOpen(true)}
                                    >
                                        <IconShare size={18} />
                                    </ActionIcon>
                                </Tooltip>
                            )}

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
                                {songsList.length > 0 ? activeIndex + 1 : 0}/{songsList.length}
                            </Badge>
                            <ActionIcon
                                variant="filled"
                                color="violet"
                                radius="xl"
                                disabled={activeIndex >= songsList.length - 1}
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
                                    {isEditingViaSharedLink && (
                                        <Badge
                                            size="xs"
                                            color="teal"
                                            variant="light"
                                            radius="xl"
                                            mt={4}
                                            leftSection={<IconLink size={11} />}
                                        >
                                            {viewI18n.editingViaLinkBadge}
                                        </Badge>
                                    )}
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
                            {songsList.length > 0 && (
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
                                        disabled={activeIndex >= songsList.length - 1}
                                        onClick={goNext}
                                    >
                                        {viewI18n.nextSong}
                                    </Button>
                                </Group>
                            )}

                            {/* Controls: Recording Toggle, Focus Mode, PDF Export & Edit Songs */}
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
                                    disabled={songsList.length === 0}
                                >
                                    {viewI18n.focusModeEnter}
                                </Button>

                                <Button
                                    size="xs"
                                    radius="xl"
                                    variant="light"
                                    color="violet"
                                    leftSection={<IconFileTypePdf size={15} />}
                                    onClick={handleExportRepertoirePdf}
                                    disabled={songsList.length === 0}
                                >
                                    {viewI18n.exportRepertoirePdf}
                                </Button>

                                {canEditRepertoire && (
                                    <Button
                                        size="xs"
                                        radius="xl"
                                        variant="light"
                                        color="teal"
                                        leftSection={<IconEdit size={15} />}
                                        onClick={openEditModal}
                                    >
                                        {viewI18n.editSongsButton}
                                    </Button>
                                )}

                                {canShareRepertoire && (
                                    <Button
                                        size="xs"
                                        radius="xl"
                                        variant="light"
                                        color="indigo"
                                        leftSection={<IconUsers size={15} />}
                                        rightSection={
                                            editorsList.length > 0 ? (
                                                <Badge
                                                    size="xs"
                                                    color="indigo"
                                                    variant="filled"
                                                    radius="xl"
                                                >
                                                    {editorsList.length}
                                                </Badge>
                                            ) : null
                                        }
                                        onClick={openEditorsModal}
                                    >
                                        {viewI18n.manageEditorsButton}
                                    </Button>
                                )}

                                {canShareRepertoire && (
                                    <Button
                                        size="xs"
                                        radius="xl"
                                        variant="light"
                                        color="cyan"
                                        leftSection={<IconShare size={15} />}
                                        onClick={() => setShareModalOpen(true)}
                                    >
                                        {viewI18n.shareEditLinkButton}
                                    </Button>
                                )}

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
                                <Group gap={6}>
                                    <Badge color="violet" variant="light" size="sm" radius="xl">
                                        {songsList.length > 0 ? activeIndex + 1 : 0} /{' '}
                                        {songsList.length}
                                    </Badge>
                                    {canEditRepertoire && (
                                        <Tooltip label={viewI18n.editSongsButton}>
                                            <ActionIcon
                                                size="sm"
                                                radius="xl"
                                                variant="subtle"
                                                color="teal"
                                                onClick={openEditModal}
                                            >
                                                <IconPlaylistAdd size={15} />
                                            </ActionIcon>
                                        </Tooltip>
                                    )}
                                </Group>
                            </Group>

                            <div className="repertoire-sidebar-songs">
                                {songsList.map((song, idx) => (
                                    <div
                                        key={song.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setActiveIndex(idx)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                setActiveIndex(idx);
                                            }
                                        }}
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
                                        <Group gap={4} wrap="nowrap">
                                            {song.key && (
                                                <Badge
                                                    size="xs"
                                                    variant={
                                                        idx === activeIndex ? 'filled' : 'light'
                                                    }
                                                    color={idx === activeIndex ? 'dark' : 'violet'}
                                                >
                                                    {song.key}
                                                </Badge>
                                            )}
                                            {canEditRepertoire && (
                                                <Tooltip label={viewI18n.removeSongTooltip}>
                                                    <ActionIcon
                                                        size="xs"
                                                        radius="xl"
                                                        variant="subtle"
                                                        color={
                                                            idx === activeIndex ? 'gray.0' : 'red'
                                                        }
                                                        disabled={isSavingRepertoire}
                                                        onClick={e =>
                                                            handleQuickRemoveSongFromSidebar(
                                                                e,
                                                                song.id,
                                                            )
                                                        }
                                                    >
                                                        <IconTrash size={13} />
                                                    </ActionIcon>
                                                </Tooltip>
                                            )}
                                        </Group>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </aside>
            )}

            {/* Modal for Adding, Removing, and Reordering Songs in the Repertoire */}
            <Modal
                opened={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                title={
                    <Group gap="xs">
                        <IconPlaylistAdd size={20} color="#a78bfa" />
                        <Text fw={700}>{viewI18n.editModalTitle}</Text>
                    </Group>
                }
                size="xl"
                centered
            >
                <Stack gap="md">
                    {/* Search & Add New Songs */}
                    <div>
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb={6}>
                            {viewI18n.addSongsSectionTitle}
                        </Text>
                        <TextInput
                            placeholder={viewI18n.searchSongsPlaceholder}
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                            leftSection={<IconSearch size={16} />}
                            rightSection={isSearching ? <Loader size="xs" /> : null}
                        />

                        {searchQuery.trim().length >= 2 && (
                            <div
                                className="repertoire-search-results"
                                style={{ maxHeight: '14rem', marginTop: '0.65rem' }}
                            >
                                {isSearching ? (
                                    <Group justify="center" py="md">
                                        <Loader size="sm" color="violet" />
                                    </Group>
                                ) : searchResults.length === 0 ? (
                                    <Text size="xs" c="dimmed" ta="center" py="sm">
                                        {viewI18n.noSearchResults}
                                    </Text>
                                ) : (
                                    searchResults.map(song => {
                                        const isAdded = draftSongIdsSet.has(song.id);
                                        return (
                                            <div
                                                key={song.id}
                                                className="repertoire-selected-item"
                                            >
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <Group gap="xs" wrap="nowrap">
                                                        <Text fw={600} size="sm" truncate>
                                                            {song.name}
                                                        </Text>
                                                        <Text size="xs" c="dimmed" truncate>
                                                            — {song.artist_name}
                                                        </Text>
                                                        {song.key && (
                                                            <Badge
                                                                size="xs"
                                                                variant="light"
                                                                color="violet"
                                                            >
                                                                {song.key}
                                                            </Badge>
                                                        )}
                                                    </Group>
                                                </div>
                                                <Button
                                                    size="compact-xs"
                                                    radius="xl"
                                                    color={isAdded ? 'teal' : 'violet'}
                                                    variant={isAdded ? 'light' : 'filled'}
                                                    disabled={isAdded}
                                                    leftSection={
                                                        isAdded ? (
                                                            <IconCheck size={13} />
                                                        ) : (
                                                            <IconPlus size={13} />
                                                        )
                                                    }
                                                    onClick={() => handleAddDraftSong(song)}
                                                >
                                                    {isAdded
                                                        ? viewI18n.addedSongBtn
                                                        : viewI18n.addSongBtn}
                                                </Button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    <Divider />

                    {/* Current Songs in Repertoire (Reorder / Delete) */}
                    <div>
                        <Group justify="space-between" mb={6}>
                            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                                {viewI18n.songsInRepertoire}
                            </Text>
                            <Badge color="violet" variant="filled" size="sm" radius="xl">
                                {draftSongs.length}
                            </Badge>
                        </Group>

                        {draftSongs.length === 0 ? (
                            <Text size="sm" c="dimmed" ta="center" py="md">
                                {viewI18n.emptySongs}
                            </Text>
                        ) : (
                            <div
                                className="repertoire-selected-list"
                                style={{ maxHeight: '16rem' }}
                            >
                                {draftSongs.map((song, idx) => (
                                    <div key={song.id} className="repertoire-selected-item">
                                        <Group
                                            gap="sm"
                                            wrap="nowrap"
                                            style={{ minWidth: 0, flex: 1 }}
                                        >
                                            <span className="repertoire-index-pill">
                                                {idx + 1}
                                            </span>
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <Text fw={600} size="sm" truncate>
                                                    {song.name}
                                                </Text>
                                                <Group gap={6}>
                                                    <Text size="xs" c="dimmed" truncate>
                                                        {song.artist_name}
                                                    </Text>
                                                    {song.key && (
                                                        <Badge
                                                            size="xs"
                                                            variant="outline"
                                                            color="violet"
                                                        >
                                                            {song.key}
                                                        </Badge>
                                                    )}
                                                </Group>
                                            </div>
                                        </Group>

                                        <Group gap={4} wrap="nowrap">
                                            <Tooltip label={viewI18n.moveUpTooltip}>
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="gray"
                                                    disabled={idx === 0}
                                                    onClick={() => handleMoveDraftSong(idx, 'up')}
                                                >
                                                    <IconArrowUp size={16} />
                                                </ActionIcon>
                                            </Tooltip>
                                            <Tooltip label={viewI18n.moveDownTooltip}>
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="gray"
                                                    disabled={idx === draftSongs.length - 1}
                                                    onClick={() =>
                                                        handleMoveDraftSong(idx, 'down')
                                                    }
                                                >
                                                    <IconArrowDown size={16} />
                                                </ActionIcon>
                                            </Tooltip>
                                            <Tooltip label={viewI18n.removeSongTooltip}>
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="red"
                                                    onClick={() => handleRemoveDraftSong(song.id)}
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Tooltip>
                                        </Group>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Group justify="flex-end" gap="sm" mt="xs">
                        <Button
                            variant="subtle"
                            color="gray"
                            radius="xl"
                            onClick={() => setEditModalOpen(false)}
                            disabled={isSavingRepertoire}
                        >
                            {viewI18n.cancelBtn}
                        </Button>
                        <Button
                            radius="xl"
                            variant="gradient"
                            gradient={{ from: 'violet', to: 'grape', deg: 145 }}
                            leftSection={<IconDeviceFloppy size={16} />}
                            loading={isSavingRepertoire}
                            onClick={handleSaveModalChanges}
                        >
                            {viewI18n.saveChangesBtn}
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Modal for Generating / Copying / Revoking the Repertoire Edit Link */}
            <Modal
                opened={shareModalOpen}
                onClose={() => setShareModalOpen(false)}
                title={
                    <Group gap="xs">
                        <IconLink size={20} color="#22d3ee" />
                        <Text fw={700}>{viewI18n.shareModalTitle}</Text>
                    </Group>
                }
                size="md"
                centered
            >
                <Stack gap="md">
                    <Text size="sm" c="dimmed">
                        {viewI18n.shareModalDescription}
                    </Text>

                    {activeEditLinkToken ? (
                        <Stack gap="sm">
                            <Group gap="xs" wrap="nowrap" align="center">
                                <TextInput
                                    value={shareableEditUrl}
                                    readOnly
                                    style={{ flex: 1 }}
                                    leftSection={<IconLink size={15} />}
                                    onClick={e => e.currentTarget.select()}
                                />
                                <Button
                                    radius="xl"
                                    color={copiedLink ? 'teal' : 'violet'}
                                    variant={copiedLink ? 'light' : 'filled'}
                                    leftSection={
                                        copiedLink ? (
                                            <IconCheck size={16} />
                                        ) : (
                                            <IconCopy size={16} />
                                        )
                                    }
                                    onClick={handleCopyEditLink}
                                >
                                    {copiedLink ? viewI18n.copiedLinkBtn : viewI18n.copyLinkBtn}
                                </Button>
                            </Group>

                            <Divider />

                            <Group justify="space-between" wrap="wrap" gap="xs">
                                <Button
                                    size="xs"
                                    radius="xl"
                                    variant="light"
                                    color="violet"
                                    leftSection={<IconRefresh size={15} />}
                                    loading={isManagingLink}
                                    onClick={handleGenerateEditLink}
                                >
                                    {viewI18n.regenerateLinkBtn}
                                </Button>

                                <Button
                                    size="xs"
                                    radius="xl"
                                    variant="subtle"
                                    color="red"
                                    leftSection={<IconLinkOff size={15} />}
                                    loading={isManagingLink}
                                    onClick={handleRevokeEditLink}
                                >
                                    {viewI18n.revokeLinkBtn}
                                </Button>
                            </Group>
                        </Stack>
                    ) : (
                        <Stack gap="sm" align="center" py="sm">
                            <Text size="sm" c="dimmed" ta="center">
                                {viewI18n.noActiveLinkNotice}
                            </Text>
                            <Button
                                radius="xl"
                                variant="gradient"
                                gradient={{ from: 'violet', to: 'cyan', deg: 145 }}
                                leftSection={<IconLink size={16} />}
                                loading={isManagingLink}
                                onClick={handleGenerateEditLink}
                            >
                                {viewI18n.generateLinkBtn}
                            </Button>
                        </Stack>
                    )}
                </Stack>
            </Modal>

            {/* Modal for Adding and Removing Editor Users */}
            <Modal
                opened={editorsModalOpen}
                onClose={() => setEditorsModalOpen(false)}
                title={
                    <Group gap="xs">
                        <IconUsers size={20} color="#818cf8" />
                        <Text fw={700}>{viewI18n.editorsModalTitle}</Text>
                    </Group>
                }
                size="lg"
                centered
            >
                <Stack gap="md">
                    <Text size="sm" c="dimmed">
                        {viewI18n.editorsModalDescription}
                    </Text>

                    <div>
                        <Group gap="xs" wrap="nowrap">
                            <TextInput
                                style={{ flex: 1 }}
                                placeholder={viewI18n.searchEditorPlaceholder}
                                value={editorSearchQuery}
                                onChange={handleEditorSearchInputChange}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' && editorSearchQuery.trim().length >= 2) {
                                        e.preventDefault();
                                        handleAddEditor({ identifier: editorSearchQuery.trim() });
                                    }
                                }}
                                leftSection={<IconSearch size={16} />}
                                rightSection={isSearchingUsers ? <Loader size="xs" /> : null}
                            />
                            <Button
                                radius="xl"
                                color="violet"
                                leftSection={<IconUserPlus size={16} />}
                                disabled={editorSearchQuery.trim().length < 2 || isManagingEditors}
                                loading={isManagingEditors}
                                onClick={() =>
                                    handleAddEditor({ identifier: editorSearchQuery.trim() })
                                }
                            >
                                {viewI18n.addEditorBtn}
                            </Button>
                        </Group>

                        {editorSearchQuery.trim().length >= 2 && (
                            <div
                                className="repertoire-search-results"
                                style={{ maxHeight: '13rem', marginTop: '0.65rem' }}
                            >
                                {isSearchingUsers ? (
                                    <Group justify="center" py="md">
                                        <Loader size="sm" color="violet" />
                                    </Group>
                                ) : editorSearchResults.length === 0 ? (
                                    <Text size="xs" c="dimmed" ta="center" py="sm">
                                        {viewI18n.noUsersFound}
                                    </Text>
                                ) : (
                                    editorSearchResults.map(userItem => {
                                        const isAlreadyEditor = editorIdsSet.has(userItem.id);
                                        const fullName = [userItem.name, userItem.lastname]
                                            .filter(Boolean)
                                            .join(' ');
                                        return (
                                            <div
                                                key={userItem.id}
                                                className="repertoire-selected-item"
                                            >
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <Group gap="xs" wrap="nowrap">
                                                        <Text fw={600} size="sm" truncate>
                                                            @{userItem.username}
                                                        </Text>
                                                        {fullName && (
                                                            <Text size="xs" c="dimmed" truncate>
                                                                ({fullName})
                                                            </Text>
                                                        )}
                                                    </Group>
                                                    <Text size="xs" c="dimmed" truncate>
                                                        {userItem.email}
                                                    </Text>
                                                </div>
                                                <Button
                                                    size="compact-xs"
                                                    radius="xl"
                                                    color={isAlreadyEditor ? 'teal' : 'violet'}
                                                    variant={isAlreadyEditor ? 'light' : 'filled'}
                                                    disabled={isAlreadyEditor || isManagingEditors}
                                                    leftSection={
                                                        isAlreadyEditor ? (
                                                            <IconCheck size={13} />
                                                        ) : (
                                                            <IconUserPlus size={13} />
                                                        )
                                                    }
                                                    onClick={() =>
                                                        handleAddEditor({ userId: userItem.id })
                                                    }
                                                >
                                                    {isAlreadyEditor
                                                        ? viewI18n.alreadyEditorBtn
                                                        : viewI18n.addEditorBtn}
                                                </Button>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    <Divider />

                    <div>
                        <Group justify="space-between" mb={6}>
                            <Text size="xs" fw={700} tt="uppercase" c="dimmed">
                                {viewI18n.currentEditorsTitle}
                            </Text>
                            <Badge color="indigo" variant="filled" size="sm" radius="xl">
                                {editorsList.length}
                            </Badge>
                        </Group>

                        {editorsList.length === 0 ? (
                            <Text size="sm" c="dimmed" ta="center" py="md">
                                {viewI18n.noEditorsEmpty}
                            </Text>
                        ) : (
                            <div
                                className="repertoire-selected-list"
                                style={{ maxHeight: '14rem' }}
                            >
                                {editorsList.map(editor => {
                                    const fullName = [editor.name, editor.lastname]
                                        .filter(Boolean)
                                        .join(' ');
                                    return (
                                        <div
                                            key={editor.id}
                                            className="repertoire-selected-item"
                                        >
                                            <div style={{ minWidth: 0, flex: 1 }}>
                                                <Group gap="xs" wrap="nowrap">
                                                    <Text fw={600} size="sm" truncate>
                                                        @{editor.username}
                                                    </Text>
                                                    {fullName && (
                                                        <Text size="xs" c="dimmed" truncate>
                                                            — {fullName}
                                                        </Text>
                                                    )}
                                                </Group>
                                                <Text size="xs" c="dimmed" truncate>
                                                    {editor.email}
                                                </Text>
                                            </div>
                                            <Tooltip label={viewI18n.removeEditorTooltip}>
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="red"
                                                    disabled={isManagingEditors}
                                                    onClick={() => handleRemoveEditor(editor.id)}
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Tooltip>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Stack>
            </Modal>
        </div>
    );
}
