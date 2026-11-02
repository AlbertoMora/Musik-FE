'use client';

import { IRepertoireDTO } from '@/domain/repertoires/repertoire-gateway';
import { I18nTypes } from '@/i18n/dictionaries';
import {
    deleteRepertoireAction,
    getRepertoiresAction,
} from '@/infrastructure/adapters/repertoires/repertoires-actions';
import {
    ActionIcon,
    Badge,
    Button,
    Collapse,
    Group,
    Loader,
    SegmentedControl,
    Select,
    Stack,
    Text,
    TextInput,
    Title,
    Tooltip,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
    IconArrowsSort,
    IconCalendar,
    IconChevronDown,
    IconChevronRight,
    IconFolder,
    IconFolderOpen,
    IconFolderShare,
    IconFolders,
    IconMusic,
    IconPlaylist,
    IconPlus,
    IconSearch,
    IconTrash,
    IconUserCheck,
    IconUsers,
} from '@tabler/icons-react';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';

interface MyRepertoiresClientProps {
    currentUserId: string;
    initialRepertoires: IRepertoireDTO[];
    initialCount: number;
    i18n: I18nTypes['repertoires']['myRepertoires'];
}

type FolderScope = 'all' | 'owned' | 'shared';
type SortOption = 'recent' | 'oldest' | 'name_asc' | 'songs_desc';
type SongsFilter = 'all' | 'with_songs' | 'empty';

const FETCH_LIMIT = 100;

export default function MyRepertoiresClient({
    currentUserId,
    initialRepertoires,
    i18n,
}: MyRepertoiresClientProps) {
    const [repertoires, setRepertoires] = useState<IRepertoireDTO[]>(initialRepertoires);
    const [search, setSearch] = useState<string>('');
    const [activeFolder, setActiveFolder] = useState<FolderScope>('all');
    const [sortBy, setSortBy] = useState<SortOption>('recent');
    const [songsFilter, setSongsFilter] = useState<SongsFilter>('all');
    const [ownedCollapsed, setOwnedCollapsed] = useState<boolean>(false);
    const [sharedCollapsed, setSharedCollapsed] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchRepertoires = async (query: string) => {
        setIsLoading(true);
        const res = await getRepertoiresAction(0, FETCH_LIMIT, query.trim() || undefined);
        if (res.success && res.data) {
            setRepertoires(res.data.repertoires);
        }
        setIsLoading(false);
    };

    const debouncedSearch = useDebouncedCallback((val: string) => {
        fetchRepertoires(val);
    }, 300);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.currentTarget.value;
        setSearch(val);
        debouncedSearch(val);
    };

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        const res = await deleteRepertoireAction(id);
        setDeletingId(null);

        if (!res.success) {
            notifications.show({
                title: 'Error',
                message: i18n.deleteError,
                color: 'red',
            });
            return;
        }

        notifications.show({
            title: 'OK',
            message: i18n.deleteSuccess,
            color: 'teal',
        });

        setRepertoires(prev => prev.filter(r => r._id !== id));
    };

    const applyFiltersAndSort = useMemo(() => {
        return (list: IRepertoireDTO[]) => {
            const filtered = list.filter(rep => {
                const count = rep.lyrics?.length ?? 0;
                if (songsFilter === 'with_songs' && count === 0) return false;
                if (songsFilter === 'empty' && count > 0) return false;
                if (search.trim()) {
                    const q = search.trim().toLowerCase();
                    const matchesName = rep.name.toLowerCase().includes(q);
                    const matchesOwner = rep.ownerUsername?.toLowerCase().includes(q) ?? false;
                    if (!matchesName && !matchesOwner) return false;
                }
                return true;
            });

            return [...filtered].sort((a, b) => {
                if (sortBy === 'name_asc') {
                    return a.name.localeCompare(b.name);
                }
                if (sortBy === 'songs_desc') {
                    return (b.lyrics?.length ?? 0) - (a.lyrics?.length ?? 0);
                }
                const dateA = new Date(a.lastModified || a.creationDate || 0).getTime();
                const dateB = new Date(b.lastModified || b.creationDate || 0).getTime();
                return sortBy === 'oldest' ? dateA - dateB : dateB - dateA;
            });
        };
    }, [songsFilter, search, sortBy]);

    const rawOwned = useMemo(
        () => repertoires.filter(r => r.userId === currentUserId),
        [repertoires, currentUserId],
    );

    const rawShared = useMemo(
        () => repertoires.filter(r => r.userId !== currentUserId),
        [repertoires, currentUserId],
    );

    const ownedRepertoires = useMemo(
        () => applyFiltersAndSort(rawOwned),
        [applyFiltersAndSort, rawOwned],
    );

    const sharedRepertoires = useMemo(
        () => applyFiltersAndSort(rawShared),
        [applyFiltersAndSort, rawShared],
    );

    const renderRepertoireCard = (rep: IRepertoireDTO, isOwnedByCurrentUser: boolean) => {
        const songsCount = rep.lyrics?.length ?? 0;
        const targetSlug = rep.slug || rep._id;
        const formattedDate = rep.lastModified
            ? new Date(rep.lastModified).toLocaleDateString()
            : '';

        return (
            <div key={rep._id} className="my-repertoire-card">
                <Stack gap="xs">
                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                        <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                            <IconPlaylist
                                size={22}
                                color={isOwnedByCurrentUser ? '#a78bfa' : '#22d3ee'}
                            />
                            <Title order={4} lineClamp={1}>
                                {rep.name}
                            </Title>
                        </Group>
                        <Badge color="violet" variant="light" radius="xl">
                            <Group gap={4} wrap="nowrap">
                                <IconMusic size={12} />
                                <span>
                                    {songsCount}{' '}
                                    {songsCount === 1
                                        ? i18n.songSingularLabel
                                        : i18n.songsCountLabel}
                                </span>
                            </Group>
                        </Badge>
                    </Group>

                    <Group justify="space-between" align="center" wrap="wrap" gap={6}>
                        {isOwnedByCurrentUser ? (
                            <Badge
                                size="xs"
                                color="grape"
                                variant="outline"
                                radius="xl"
                                leftSection={<IconUserCheck size={11} />}
                            >
                                {i18n.ownerBadge}
                            </Badge>
                        ) : (
                            <Badge
                                size="xs"
                                color="cyan"
                                variant="light"
                                radius="xl"
                                leftSection={<IconUsers size={11} />}
                            >
                                {rep.ownerUsername
                                    ? `${i18n.sharedByBadge} @${rep.ownerUsername}`
                                    : i18n.sharedEditorBadge}
                            </Badge>
                        )}

                        {formattedDate && (
                            <Group gap={4} c="dimmed">
                                <IconCalendar size={13} />
                                <Text size="xs">
                                    {i18n.updatedLabel} {formattedDate}
                                </Text>
                            </Group>
                        )}
                    </Group>
                </Stack>

                <Group justify="space-between" align="center" mt="xs">
                    <Button
                        component={Link}
                        href={`/repertoires/${targetSlug}`}
                        radius="xl"
                        size="sm"
                        color={isOwnedByCurrentUser ? 'violet' : 'cyan'}
                        variant="light"
                        style={{ flex: 1 }}
                    >
                        {i18n.openButton}
                    </Button>

                    {isOwnedByCurrentUser && (
                        <Tooltip label={i18n.deleteButton}>
                            <ActionIcon
                                color="red"
                                variant="subtle"
                                size="lg"
                                radius="xl"
                                loading={deletingId === rep._id}
                                onClick={() => handleDelete(rep._id)}
                            >
                                <IconTrash size={17} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                </Group>
            </div>
        );
    };

    return (
        <div className="mt-4">
            {/* Top Search, Filters, and New Repertoire CTA */}
            <Group justify="space-between" align="center" wrap="wrap" gap="md">
                <TextInput
                    className="input-background"
                    style={{ flex: '1 1 260px', maxWidth: 420 }}
                    placeholder={i18n.searchPlaceholder}
                    value={search}
                    onChange={handleSearchChange}
                    leftSection={<IconSearch size={16} />}
                    rightSection={isLoading ? <Loader size="xs" /> : null}
                />

                <Group gap="sm" wrap="wrap">
                    <Select
                        size="sm"
                        radius="xl"
                        w={185}
                        allowDeselect={false}
                        value={sortBy}
                        onChange={val => setSortBy((val as SortOption) || 'recent')}
                        leftSection={<IconArrowsSort size={15} />}
                        aria-label={i18n.sortByLabel}
                        data={[
                            { value: 'recent', label: i18n.sortRecent },
                            { value: 'oldest', label: i18n.sortOldest },
                            { value: 'name_asc', label: i18n.sortNameAsc },
                            { value: 'songs_desc', label: i18n.sortSongsDesc },
                        ]}
                    />

                    <SegmentedControl
                        size="xs"
                        radius="xl"
                        color="violet"
                        value={songsFilter}
                        onChange={val => setSongsFilter(val as SongsFilter)}
                        data={[
                            { value: 'all', label: i18n.filterAllSongs },
                            { value: 'with_songs', label: i18n.filterWithSongs },
                            { value: 'empty', label: i18n.filterEmptySongs },
                        ]}
                    />

                    <Button
                        component={Link}
                        href="/repertoires/create"
                        radius="xl"
                        size="sm"
                        variant="gradient"
                        gradient={{ from: 'violet', to: 'grape', deg: 145 }}
                        leftSection={<IconPlus size={17} />}
                    >
                        {i18n.createButton}
                    </Button>
                </Group>
            </Group>

            {/* Visual Folder Selector Cards ("Carpetas") */}
            <div className="my-repertoires-folders-bar">
                <button
                    type="button"
                    className={`repertoire-folder-tab ${
                        activeFolder === 'all' ? 'is-active' : ''
                    }`}
                    onClick={() => setActiveFolder('all')}
                >
                    <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                        <div className="repertoire-folder-icon-wrap repertoire-folder-icon-wrap--all">
                            <IconFolders size={22} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <Text fw={700} size="sm" truncate>
                                {i18n.folderAllTitle}
                            </Text>
                            <Text size="xs" c="dimmed" truncate>
                                {i18n.folderAllSubtitle}
                            </Text>
                        </div>
                    </Group>
                    <Badge color="pink" variant="light" radius="xl" size="lg">
                        {ownedRepertoires.length + sharedRepertoires.length}
                    </Badge>
                </button>

                <button
                    type="button"
                    className={`repertoire-folder-tab ${
                        activeFolder === 'owned' ? 'is-active' : ''
                    }`}
                    onClick={() => {
                        setActiveFolder('owned');
                        setOwnedCollapsed(false);
                    }}
                >
                    <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                        <div className="repertoire-folder-icon-wrap">
                            {activeFolder === 'owned' ? (
                                <IconFolderOpen size={22} />
                            ) : (
                                <IconFolder size={22} />
                            )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <Text fw={700} size="sm" truncate>
                                {i18n.folderOwnedTitle}
                            </Text>
                            <Text size="xs" c="dimmed" truncate>
                                {i18n.folderOwnedSubtitle}
                            </Text>
                        </div>
                    </Group>
                    <Badge color="violet" variant="light" radius="xl" size="lg">
                        {ownedRepertoires.length}
                    </Badge>
                </button>

                <button
                    type="button"
                    className={`repertoire-folder-tab ${
                        activeFolder === 'shared' ? 'is-active' : ''
                    }`}
                    onClick={() => {
                        setActiveFolder('shared');
                        setSharedCollapsed(false);
                    }}
                >
                    <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                        <div className="repertoire-folder-icon-wrap repertoire-folder-icon-wrap--shared">
                            <IconFolderShare size={22} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <Text fw={700} size="sm" truncate>
                                {i18n.folderSharedTitle}
                            </Text>
                            <Text size="xs" c="dimmed" truncate>
                                {i18n.folderSharedSubtitle}
                            </Text>
                        </div>
                    </Group>
                    <Badge color="cyan" variant="light" radius="xl" size="lg">
                        {sharedRepertoires.length}
                    </Badge>
                </button>
            </div>

            {isLoading ? (
                <div className="repertoire-empty-box mt-6">
                    <Loader color="violet" />
                </div>
            ) : repertoires.length === 0 ? (
                <div className="repertoire-empty-box mt-6">
                    <IconPlaylist size={46} stroke={1.5} />
                    <Title order={4}>{i18n.emptyTitle}</Title>
                    <Text size="sm" maw={420}>
                        {i18n.emptyDescription}
                    </Text>
                    <Button
                        component={Link}
                        href="/repertoires/create"
                        mt="xs"
                        radius="xl"
                        color="violet"
                        leftSection={<IconPlus size={16} />}
                    >
                        {i18n.createButton}
                    </Button>
                </div>
            ) : (
                <>
                    {/* Folder 1: Owned Repertoires ("Mis Repertorios") */}
                    {(activeFolder === 'all' || activeFolder === 'owned') && (
                        <section className="repertoire-folder-section">
                            <div
                                role="button"
                                tabIndex={0}
                                className="repertoire-folder-section-header"
                                onClick={() => setOwnedCollapsed(c => !c)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setOwnedCollapsed(c => !c);
                                    }
                                }}
                            >
                                <Group gap="sm">
                                    <div className="repertoire-folder-icon-wrap">
                                        {ownedCollapsed ? (
                                            <IconFolder size={20} />
                                        ) : (
                                            <IconFolderOpen size={20} />
                                        )}
                                    </div>
                                    <div>
                                        <Group gap="xs">
                                            <Title order={4}>{i18n.folderOwnedTitle}</Title>
                                            <Badge color="violet" variant="filled" radius="xl">
                                                {ownedRepertoires.length}
                                            </Badge>
                                        </Group>
                                        <Text size="xs" c="dimmed">
                                            {i18n.folderOwnedSubtitle}
                                        </Text>
                                    </div>
                                </Group>

                                <ActionIcon variant="subtle" color="gray" radius="xl">
                                    {ownedCollapsed ? (
                                        <IconChevronRight size={18} />
                                    ) : (
                                        <IconChevronDown size={18} />
                                    )}
                                </ActionIcon>
                            </div>

                            <Collapse in={!ownedCollapsed}>
                                {ownedRepertoires.length === 0 ? (
                                    <Text size="sm" c="dimmed" ta="center" py="lg">
                                        {i18n.emptyOwnedFolder}
                                    </Text>
                                ) : (
                                    <div className="my-repertoires-grid">
                                        {ownedRepertoires.map(rep =>
                                            renderRepertoireCard(rep, true),
                                        )}
                                    </div>
                                )}
                            </Collapse>
                        </section>
                    )}

                    {/* Folder 2: Shared Repertoires ("Compartidos conmigo") */}
                    {(activeFolder === 'all' || activeFolder === 'shared') && (
                        <section className="repertoire-folder-section">
                            <div
                                role="button"
                                tabIndex={0}
                                className="repertoire-folder-section-header"
                                onClick={() => setSharedCollapsed(c => !c)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setSharedCollapsed(c => !c);
                                    }
                                }}
                            >
                                <Group gap="sm">
                                    <div className="repertoire-folder-icon-wrap repertoire-folder-icon-wrap--shared">
                                        <IconFolderShare size={20} />
                                    </div>
                                    <div>
                                        <Group gap="xs">
                                            <Title order={4}>{i18n.folderSharedTitle}</Title>
                                            <Badge color="cyan" variant="filled" radius="xl">
                                                {sharedRepertoires.length}
                                            </Badge>
                                        </Group>
                                        <Text size="xs" c="dimmed">
                                            {i18n.folderSharedSubtitle}
                                        </Text>
                                    </div>
                                </Group>

                                <ActionIcon variant="subtle" color="gray" radius="xl">
                                    {sharedCollapsed ? (
                                        <IconChevronRight size={18} />
                                    ) : (
                                        <IconChevronDown size={18} />
                                    )}
                                </ActionIcon>
                            </div>

                            <Collapse in={!sharedCollapsed}>
                                {sharedRepertoires.length === 0 ? (
                                    <Text size="sm" c="dimmed" ta="center" py="lg">
                                        {i18n.emptySharedFolder}
                                    </Text>
                                ) : (
                                    <div className="my-repertoires-grid">
                                        {sharedRepertoires.map(rep =>
                                            renderRepertoireCard(rep, false),
                                        )}
                                    </div>
                                )}
                            </Collapse>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}
