'use client';

import {
    IEditorModel,
    IEditorSongItemDTO,
    IEditorSongsFacetsDTO,
    IEditorSongsFilterParams,
} from '@/domain/editors/editor-gateway';
import { I18nTypes } from '@/i18n/dictionaries';
import { getEditorBySlugWithSongsAction } from '@/infrastructure/adapters/editors/editors-actions';
import { softDeleteSongAction } from '@/infrastructure/adapters/songs/songs-actions';
import {
    NotificationService,
    NotificationTypes,
} from '@/presentation/services/notification-service';
import { getSlugifiedValue, removeChords } from '@/utils/text-utils';
import {
    ActionIcon,
    Alert,
    Avatar,
    Badge,
    Button,
    Collapse,
    Divider,
    Group,
    Loader,
    Modal,
    Pagination,
    SegmentedControl,
    Select,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    Title,
    Tooltip,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import {
    IconAdjustmentsHorizontal,
    IconArrowsSort,
    IconCalendar,
    IconClock,
    IconDisc,
    IconFileText,
    IconFilterOff,
    IconGitFork,
    IconHeadphones,
    IconMicrophone,
    IconMusic,
    IconPlus,
    IconSearch,
    IconSortAscending,
    IconSortDescending,
    IconSparkles,
    IconTrash,
    IconUserCheck,
    IconUserEdit,
} from '@tabler/icons-react';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';

interface EditorSongsCatalogClientProps {
    editor: IEditorModel;
    isSelf: boolean;
    initialSongs: IEditorSongItemDTO[];
    initialCount: number;
    totalEditorSongs: number;
    facets: IEditorSongsFacetsDTO;
    i18n: I18nTypes['editors']['view'];
}

const PAGE_SIZE = 9;

type SortField = NonNullable<IEditorSongsFilterParams['sortBy']>;

export default function EditorSongsCatalogClient({
    editor,
    isSelf,
    initialSongs,
    initialCount,
    totalEditorSongs: initialTotalEditorSongs,
    facets,
    i18n,
}: EditorSongsCatalogClientProps) {
    const [songs, setSongs] = useState<IEditorSongItemDTO[]>(initialSongs);
    const [totalCount, setTotalCount] = useState<number>(initialCount);
    const [totalEditorSongs, setTotalEditorSongs] = useState<number>(initialTotalEditorSongs);
    const [page, setPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

    // Soft-delete modal state (only when isSelf === true)
    const [songPendingDelete, setSongPendingDelete] = useState<IEditorSongItemDTO | null>(null);
    const [isDeletingSong, setIsDeletingSong] = useState<boolean>(false);

    // Filter state for every column of `lyrics`
    const [name, setName] = useState('');
    const [lyricsText, setLyricsText] = useState('');
    const [genre, setGenre] = useState('');
    const [songKey, setSongKey] = useState('');
    const [bpmMin, setBpmMin] = useState('');
    const [bpmMax, setBpmMax] = useState('');
    const [hasSample, setHasSample] = useState<'all' | 'yes' | 'no'>('all');
    const [artistFilter, setArtistFilter] = useState('');
    const [forkOf, setForkOf] = useState('');
    const [albumId, setAlbumId] = useState('');
    const [creationDateFrom, setCreationDateFrom] = useState('');
    const [creationDateTo, setCreationDateTo] = useState('');
    const [lastModifiedFrom, setLastModifiedFrom] = useState('');
    const [lastModifiedTo, setLastModifiedTo] = useState('');
    const [lyricId, setLyricId] = useState('');

    // Sort state
    const [sortBy, setSortBy] = useState<SortField>('creation_date');
    const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>('DESC');

    const activeFilterCount = useMemo(() => {
        return [
            name.trim(),
            lyricsText.trim(),
            genre.trim(),
            songKey.trim(),
            bpmMin.trim(),
            bpmMax.trim(),
            hasSample !== 'all' ? hasSample : '',
            artistFilter.trim(),
            forkOf.trim(),
            albumId.trim(),
            creationDateFrom.trim(),
            creationDateTo.trim(),
            lastModifiedFrom.trim(),
            lastModifiedTo.trim(),
            lyricId.trim(),
        ].filter(Boolean).length;
    }, [
        name,
        lyricsText,
        genre,
        songKey,
        bpmMin,
        bpmMax,
        hasSample,
        artistFilter,
        forkOf,
        albumId,
        creationDateFrom,
        creationDateTo,
        lastModifiedFrom,
        lastModifiedTo,
        lyricId,
    ]);

    const runQuery = async (
        targetPage: number,
        overrides: Partial<IEditorSongsFilterParams> = {},
    ) => {
        setIsLoading(true);
        const offset = (targetPage - 1) * PAGE_SIZE;
        const payload: IEditorSongsFilterParams = {
            page: offset,
            limit: PAGE_SIZE,
            name: name.trim() || undefined,
            lyrics_text: lyricsText.trim() || undefined,
            genre: genre.trim() || undefined,
            key: songKey.trim() || undefined,
            bpmMin: bpmMin.trim() || undefined,
            bpmMax: bpmMax.trim() || undefined,
            hasSample,
            artist_id: artistFilter.trim() || undefined,
            fork_of: forkOf.trim() || undefined,
            album_id: albumId.trim() || undefined,
            creationDateFrom: creationDateFrom.trim() || undefined,
            creationDateTo: creationDateTo.trim() || undefined,
            lastModifiedFrom: lastModifiedFrom.trim() || undefined,
            lastModifiedTo: lastModifiedTo.trim() || undefined,
            id: lyricId.trim() || undefined,
            sortBy,
            sortDir,
            ...overrides,
        };

        const res = await getEditorBySlugWithSongsAction(editor.slug || editor.username, payload);
        if (res.success && res.data) {
            setSongs(res.data.songs);
            setTotalCount(res.data.count);
            setTotalEditorSongs(res.data.totalEditorSongs);
        }
        setIsLoading(false);
    };

    const debouncedQuery = useDebouncedCallback(
        (overrides: Partial<IEditorSongsFilterParams>) => {
            setPage(1);
            runQuery(1, overrides);
        },
        320,
    );

    const handleClearAllFilters = () => {
        setName('');
        setLyricsText('');
        setGenre('');
        setSongKey('');
        setBpmMin('');
        setBpmMax('');
        setHasSample('all');
        setArtistFilter('');
        setForkOf('');
        setAlbumId('');
        setCreationDateFrom('');
        setCreationDateTo('');
        setLastModifiedFrom('');
        setLastModifiedTo('');
        setLyricId('');
        setPage(1);
        runQuery(1, {
            name: undefined,
            lyrics_text: undefined,
            genre: undefined,
            key: undefined,
            bpmMin: undefined,
            bpmMax: undefined,
            hasSample: 'all',
            artist_id: undefined,
            fork_of: undefined,
            album_id: undefined,
            creationDateFrom: undefined,
            creationDateTo: undefined,
            lastModifiedFrom: undefined,
            lastModifiedTo: undefined,
            id: undefined,
        });
    };

    const handleConfirmSoftDeleteSong = async () => {
        if (!songPendingDelete || !isSelf || isDeletingSong) return;
        setIsDeletingSong(true);
        const res = await softDeleteSongAction(songPendingDelete.id);
        setIsDeletingSong(false);

        if (!res.success) {
            NotificationService.showMessage(
                i18n.card.deleteError,
                NotificationTypes.error,
                songPendingDelete.name,
            );
            return;
        }

        NotificationService.showMessage(
            i18n.card.deleteSuccess,
            NotificationTypes.ok,
            songPendingDelete.name,
        );
        setSongPendingDelete(null);

        const nextPage =
            songs.length === 1 && page > 1 ? Math.max(1, page - 1) : page;
        setPage(nextPage);
        await runQuery(nextPage);
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const fullName = [editor.name, editor.lastname].filter(Boolean).join(' ');
    const memberSinceFormatted = editor.creation_date
        ? new Date(editor.creation_date).toLocaleDateString()
        : '';

    const sortOptions = [
        { value: 'creation_date', label: i18n.fields.creation_date },
        { value: 'last_modified', label: i18n.fields.last_modified },
        { value: 'name', label: i18n.fields.name },
        { value: 'artist_id', label: i18n.fields.artist_id },
        { value: 'key', label: i18n.fields.key },
        { value: 'bpm', label: i18n.fields.bpm },
        { value: 'genre', label: i18n.fields.genre },
        { value: 'sample_uri', label: i18n.fields.sample_uri },
        { value: 'fork_of', label: i18n.fields.fork_of },
        { value: 'album_id', label: i18n.fields.album_id },
        { value: 'lyrics_text', label: i18n.fields.lyrics_text },
        { value: 'id', label: i18n.fields.id },
        { value: 'posted_by', label: i18n.fields.posted_by },
    ];

    return (
        <Stack gap="lg">
            {/* Self-profile banner when the logged-in user opens their own /editors/:slug */}
            {isSelf && (
                <Alert
                    color="violet"
                    variant="light"
                    radius="lg"
                    icon={<IconSparkles size={18} />}
                >
                    <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                        <Text size="sm">{i18n.selfBannerText}</Text>
                        <Button
                            component={Link}
                            href="/lyrics/create"
                            size="xs"
                            radius="xl"
                            variant="gradient"
                            gradient={{ from: 'violet', to: 'grape', deg: 145 }}
                            leftSection={<IconPlus size={15} />}
                        >
                            {i18n.createSongCta}
                        </Button>
                    </Group>
                </Alert>
            )}

            {/* Editor Profile Header */}
            <div className="repertoire-panel" style={{ minHeight: 'unset' }}>
                <Group justify="space-between" align="center" wrap="wrap" gap="md">
                    <Group gap="md" wrap="nowrap" style={{ minWidth: 0 }}>
                        <Avatar
                            src={editor.prof_pic || null}
                            size={68}
                            radius="xl"
                            color="violet"
                        >
                            <IconUserEdit size={32} />
                        </Avatar>
                        <div style={{ minWidth: 0 }}>
                            <Group gap="xs" align="center" wrap="wrap">
                                <Title order={2} lineClamp={1}>
                                    @{editor.username}
                                </Title>
                                {isSelf && (
                                    <Badge
                                        color="teal"
                                        variant="filled"
                                        radius="xl"
                                        leftSection={<IconUserCheck size={12} />}
                                    >
                                        {i18n.selfBadge}
                                    </Badge>
                                )}
                            </Group>
                            {fullName && (
                                <Text size="sm" c="dimmed" mt={2}>
                                    {fullName}
                                </Text>
                            )}
                            {memberSinceFormatted && (
                                <Text size="xs" c="dimmed" mt={4}>
                                    {i18n.memberSinceLabel}: {memberSinceFormatted}
                                </Text>
                            )}
                        </div>
                    </Group>

                    <Group gap="xs">
                        <Badge size="lg" color="violet" variant="light" radius="xl">
                            {i18n.totalSongsBadge}: {totalEditorSongs}
                        </Badge>
                        <Badge size="lg" color="cyan" variant="outline" radius="xl">
                            {i18n.matchingSongsBadge}: {totalCount}
                        </Badge>
                    </Group>
                </Group>
            </div>

            {/* Filters & Sorting Box */}
            <div className="repertoire-panel" style={{ minHeight: 'unset' }}>
                <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                    <Group gap="xs">
                        <IconAdjustmentsHorizontal size={19} color="#a78bfa" />
                        <Text fw={700} size="sm">
                            {i18n.filtersSectionTitle}
                        </Text>
                        {activeFilterCount > 0 && (
                            <Badge size="xs" color="violet" variant="filled" radius="xl">
                                {activeFilterCount}
                            </Badge>
                        )}
                    </Group>

                    <Group gap="xs" wrap="wrap">
                        <Select
                            size="xs"
                            radius="xl"
                            w={240}
                            allowDeselect={false}
                            value={sortBy}
                            leftSection={<IconArrowsSort size={14} />}
                            aria-label={i18n.sortByLabel}
                            data={sortOptions}
                            onChange={val => {
                                const nextSort = (val as SortField) || 'creation_date';
                                setSortBy(nextSort);
                                setPage(1);
                                runQuery(1, { sortBy: nextSort });
                            }}
                        />

                        <Tooltip label={sortDir === 'ASC' ? i18n.sortAsc : i18n.sortDesc}>
                            <Button
                                size="xs"
                                radius="xl"
                                variant="light"
                                color="violet"
                                leftSection={
                                    sortDir === 'ASC' ? (
                                        <IconSortAscending size={15} />
                                    ) : (
                                        <IconSortDescending size={15} />
                                    )
                                }
                                onClick={() => {
                                    const nextDir = sortDir === 'ASC' ? 'DESC' : 'ASC';
                                    setSortDir(nextDir);
                                    setPage(1);
                                    runQuery(1, { sortDir: nextDir });
                                }}
                            >
                                {sortDir}
                            </Button>
                        </Tooltip>

                        <Button
                            size="xs"
                            radius="xl"
                            variant="subtle"
                            color="gray"
                            onClick={() => setShowAdvanced(v => !v)}
                        >
                            {showAdvanced ? i18n.hideAdvancedFilters : i18n.showAdvancedFilters}
                        </Button>

                        {activeFilterCount > 0 && (
                            <Button
                                size="xs"
                                radius="xl"
                                variant="subtle"
                                color="red"
                                leftSection={<IconFilterOff size={14} />}
                                onClick={handleClearAllFilters}
                            >
                                {i18n.clearFiltersBtn}
                            </Button>
                        )}
                    </Group>
                </Group>

                {/* Primary Filters Row: name, lyrics_text, artist_id, key */}
                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
                    <TextInput
                        size="xs"
                        label={i18n.fields.name}
                        placeholder={i18n.placeholders.name}
                        value={name}
                        leftSection={<IconSearch size={14} />}
                        onChange={e => {
                            const val = e.currentTarget.value;
                            setName(val);
                            debouncedQuery({ name: val.trim() || undefined });
                        }}
                    />

                    <TextInput
                        size="xs"
                        label={i18n.fields.lyrics_text}
                        placeholder={i18n.placeholders.lyrics_text}
                        value={lyricsText}
                        leftSection={<IconFileText size={14} />}
                        onChange={e => {
                            const val = e.currentTarget.value;
                            setLyricsText(val);
                            debouncedQuery({ lyrics_text: val.trim() || undefined });
                        }}
                    />

                    <Select
                        size="xs"
                        clearable
                        searchable
                        label={i18n.fields.artist_id}
                        placeholder={i18n.placeholders.artist_id}
                        value={artistFilter || null}
                        data={facets.artists.map(a => ({ value: a, label: a }))}
                        onChange={val => {
                            const nextVal = val || '';
                            setArtistFilter(nextVal);
                            setPage(1);
                            runQuery(1, { artist_id: nextVal || undefined });
                        }}
                    />

                    <Select
                        size="xs"
                        clearable
                        searchable
                        label={i18n.fields.key}
                        placeholder={i18n.placeholders.key}
                        value={songKey || null}
                        data={facets.keys.map(k => ({ value: k, label: k }))}
                        onChange={val => {
                            const nextVal = val || '';
                            setSongKey(nextVal);
                            setPage(1);
                            runQuery(1, { key: nextVal || undefined });
                        }}
                    />
                </SimpleGrid>

                {/* Expandable Filters Row: genre, bpm, sample_uri, fork_of, album_id, creation_date, last_modified, id */}
                <Collapse in={showAdvanced}>
                    <Divider my="sm" />
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="sm">
                        <Select
                            size="xs"
                            clearable
                            searchable
                            label={i18n.fields.genre}
                            placeholder={i18n.placeholders.genre}
                            value={genre || null}
                            data={facets.genres.map(g => ({ value: g, label: g }))}
                            onChange={val => {
                                const nextVal = val || '';
                                setGenre(nextVal);
                                setPage(1);
                                runQuery(1, { genre: nextVal || undefined });
                            }}
                        />

                        <Group grow gap="xs" align="flex-end">
                            <TextInput
                                size="xs"
                                type="number"
                                label={i18n.fields.bpm}
                                placeholder={i18n.placeholders.bpmMin}
                                value={bpmMin}
                                onChange={e => {
                                    const val = e.currentTarget.value;
                                    setBpmMin(val);
                                    debouncedQuery({ bpmMin: val.trim() || undefined });
                                }}
                            />
                            <TextInput
                                size="xs"
                                type="number"
                                label=" "
                                placeholder={i18n.placeholders.bpmMax}
                                value={bpmMax}
                                onChange={e => {
                                    const val = e.currentTarget.value;
                                    setBpmMax(val);
                                    debouncedQuery({ bpmMax: val.trim() || undefined });
                                }}
                            />
                        </Group>

                        <div>
                            <Text size="xs" fw={500} mb={4}>
                                {i18n.fields.sample_uri}
                            </Text>
                            <SegmentedControl
                                fullWidth
                                size="xs"
                                color="violet"
                                value={hasSample}
                                data={[
                                    { value: 'all', label: i18n.placeholders.sampleAll },
                                    { value: 'yes', label: i18n.placeholders.sampleYes },
                                    { value: 'no', label: i18n.placeholders.sampleNo },
                                ]}
                                onChange={val => {
                                    const nextSample = (val as 'all' | 'yes' | 'no') || 'all';
                                    setHasSample(nextSample);
                                    setPage(1);
                                    runQuery(1, { hasSample: nextSample });
                                }}
                            />
                        </div>

                        <Select
                            size="xs"
                            clearable
                            label={i18n.fields.fork_of}
                            placeholder={i18n.placeholders.fork_of}
                            value={forkOf || null}
                            data={[
                                {
                                    value: '__original__',
                                    label: i18n.placeholders.forkOriginalOnly,
                                },
                                {
                                    value: '__fork__',
                                    label: i18n.placeholders.forkOnly,
                                },
                            ]}
                            onChange={val => {
                                const nextVal = val || '';
                                setForkOf(nextVal);
                                setPage(1);
                                runQuery(1, { fork_of: nextVal || undefined });
                            }}
                        />

                        <Select
                            size="xs"
                            clearable
                            searchable
                            label={i18n.fields.album_id}
                            placeholder={i18n.placeholders.album_id}
                            value={albumId || null}
                            data={[
                                {
                                    value: '__with_album__',
                                    label: i18n.placeholders.withAlbum,
                                },
                                {
                                    value: '__without_album__',
                                    label: i18n.placeholders.withoutAlbum,
                                },
                                ...facets.albums.map(alb => ({ value: alb, label: alb })),
                            ]}
                            onChange={val => {
                                const nextVal = val || '';
                                setAlbumId(nextVal);
                                setPage(1);
                                runQuery(1, { album_id: nextVal || undefined });
                            }}
                        />

                        <Group grow gap="xs" align="flex-end">
                            <TextInput
                                size="xs"
                                type="date"
                                label={i18n.fields.creation_date}
                                placeholder={i18n.placeholders.dateFrom}
                                value={creationDateFrom}
                                onChange={e => {
                                    const val = e.currentTarget.value;
                                    setCreationDateFrom(val);
                                    setPage(1);
                                    runQuery(1, { creationDateFrom: val || undefined });
                                }}
                            />
                            <TextInput
                                size="xs"
                                type="date"
                                label=" "
                                placeholder={i18n.placeholders.dateTo}
                                value={creationDateTo}
                                onChange={e => {
                                    const val = e.currentTarget.value;
                                    setCreationDateTo(val);
                                    setPage(1);
                                    runQuery(1, { creationDateTo: val || undefined });
                                }}
                            />
                        </Group>

                        <Group grow gap="xs" align="flex-end">
                            <TextInput
                                size="xs"
                                type="date"
                                label={i18n.fields.last_modified}
                                placeholder={i18n.placeholders.dateFrom}
                                value={lastModifiedFrom}
                                onChange={e => {
                                    const val = e.currentTarget.value;
                                    setLastModifiedFrom(val);
                                    setPage(1);
                                    runQuery(1, { lastModifiedFrom: val || undefined });
                                }}
                            />
                            <TextInput
                                size="xs"
                                type="date"
                                label=" "
                                placeholder={i18n.placeholders.dateTo}
                                value={lastModifiedTo}
                                onChange={e => {
                                    const val = e.currentTarget.value;
                                    setLastModifiedTo(val);
                                    setPage(1);
                                    runQuery(1, { lastModifiedTo: val || undefined });
                                }}
                            />
                        </Group>

                        <TextInput
                            size="xs"
                            label={i18n.fields.id}
                            placeholder={i18n.placeholders.id}
                            value={lyricId}
                            onChange={e => {
                                const val = e.currentTarget.value;
                                setLyricId(val);
                                debouncedQuery({ id: val.trim() || undefined });
                            }}
                        />
                    </SimpleGrid>
                </Collapse>
            </div>

            {/* Songs List / Grid */}
            {isLoading ? (
                <div className="repertoire-empty-box">
                    <Loader color="violet" />
                </div>
            ) : songs.length === 0 ? (
                <div className="repertoire-empty-box">
                    <IconMusic size={44} stroke={1.5} />
                    <Title order={4}>{i18n.emptySongsTitle}</Title>
                    <Text size="sm" maw={420}>
                        {i18n.emptySongsDescription}
                    </Text>
                    {activeFilterCount > 0 && (
                        <Button
                            size="xs"
                            radius="xl"
                            color="violet"
                            variant="light"
                            leftSection={<IconFilterOff size={15} />}
                            onClick={handleClearAllFilters}
                        >
                            {i18n.clearFiltersBtn}
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    <div className="my-repertoires-grid">
                        {songs.map(song => {
                            const targetSlug = song.slug || song.id;
                            const cleanSnippet = removeChords(song.lyrics_text || '')
                                .split('\n')
                                .map(line => line.trim())
                                .filter(Boolean)
                                .slice(0, 4)
                                .join('\n');

                            const createdFormatted = song.creation_date
                                ? new Date(song.creation_date).toLocaleDateString()
                                : '';
                            const modifiedFormatted = song.last_modified
                                ? new Date(song.last_modified).toLocaleDateString()
                                : '';

                            return (
                                <div key={song.id} className="my-repertoire-card">
                                    <Stack gap="xs">
                                        <Group
                                            justify="space-between"
                                            align="flex-start"
                                            wrap="nowrap"
                                        >
                                            <Group
                                                gap="xs"
                                                wrap="nowrap"
                                                style={{ minWidth: 0, flex: 1 }}
                                            >
                                                <IconMusic size={20} color="#a78bfa" />
                                                <Title order={4} lineClamp={1}>
                                                    {song.name}
                                                </Title>
                                            </Group>

                                            {song.key && (
                                                <Badge
                                                    color="violet"
                                                    variant="filled"
                                                    radius="xl"
                                                >
                                                    {i18n.card.keyLabel}: {song.key}
                                                </Badge>
                                            )}
                                        </Group>

                                        <Group gap={6} wrap="wrap">
                                            {song.artist_name && (
                                                <Badge
                                                    component={Link}
                                                    href={`/artists/${
                                                        song.artist_slug ||
                                                        getSlugifiedValue([song.artist_name])
                                                    }`}
                                                    size="xs"
                                                    color="pink"
                                                    variant="light"
                                                    radius="xl"
                                                    style={{
                                                        cursor: 'pointer',
                                                    }}
                                                    leftSection={<IconMicrophone size={11} />}
                                                >
                                                    {song.artist_name}
                                                </Badge>
                                            )}
                                            {song.genre && (
                                                <Badge
                                                    size="xs"
                                                    color="grape"
                                                    variant="light"
                                                    radius="xl"
                                                >
                                                    {song.genre}
                                                </Badge>
                                            )}
                                            {Boolean(song.bpm) && (
                                                <Badge
                                                    size="xs"
                                                    color="indigo"
                                                    variant="outline"
                                                    radius="xl"
                                                >
                                                    {song.bpm} {i18n.card.bpmLabel}
                                                </Badge>
                                            )}
                                            {song.sample_uri && (
                                                <Badge
                                                    size="xs"
                                                    color="teal"
                                                    variant="light"
                                                    radius="xl"
                                                    leftSection={<IconHeadphones size={11} />}
                                                >
                                                    {i18n.card.hasAudioBadge}
                                                </Badge>
                                            )}
                                            {song.album_name && (
                                                <Badge
                                                    size="xs"
                                                    color="cyan"
                                                    variant="light"
                                                    radius="xl"
                                                    leftSection={<IconDisc size={11} />}
                                                >
                                                    {song.album_name}
                                                </Badge>
                                            )}
                                            {(song.fork_of_name || song.fork_of) && (
                                                <Badge
                                                    size="xs"
                                                    color="orange"
                                                    variant="light"
                                                    radius="xl"
                                                    leftSection={<IconGitFork size={11} />}
                                                >
                                                    {i18n.card.forkOfLabel}:{' '}
                                                    {song.fork_of_name || song.fork_of}
                                                </Badge>
                                            )}
                                        </Group>

                                        {cleanSnippet && (
                                            <div className="repertoire-song-preview-snippet">
                                                {cleanSnippet}
                                            </div>
                                        )}

                                        <Group
                                            justify="space-between"
                                            align="center"
                                            wrap="wrap"
                                            gap={6}
                                            c="dimmed"
                                        >
                                            {createdFormatted && (
                                                <Group gap={4}>
                                                    <IconCalendar size={13} />
                                                    <Text size="xs">
                                                        {i18n.card.createdLabel}:{' '}
                                                        {createdFormatted}
                                                    </Text>
                                                </Group>
                                            )}
                                            {modifiedFormatted &&
                                                modifiedFormatted !== createdFormatted && (
                                                    <Group gap={4}>
                                                        <IconClock size={13} />
                                                        <Text size="xs">
                                                            {i18n.card.modifiedLabel}:{' '}
                                                            {modifiedFormatted}
                                                        </Text>
                                                    </Group>
                                                )}
                                        </Group>
                                    </Stack>

                                    <Group justify="space-between" align="center" gap="xs">
                                        <Button
                                            component={Link}
                                            href={`/lyrics/${targetSlug}`}
                                            radius="xl"
                                            size="sm"
                                            color="violet"
                                            variant="light"
                                            style={{ flex: 1 }}
                                        >
                                            {i18n.card.openSongBtn}
                                        </Button>

                                        {isSelf && (
                                            <Tooltip label={i18n.card.deleteSongTooltip}>
                                                <ActionIcon
                                                    color="red"
                                                    variant="subtle"
                                                    size="lg"
                                                    radius="xl"
                                                    onClick={() => setSongPendingDelete(song)}
                                                >
                                                    <IconTrash size={17} />
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                    </Group>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <Group justify="center" mt="xl">
                            <Pagination
                                total={totalPages}
                                value={page}
                                onChange={nextPage => {
                                    setPage(nextPage);
                                    runQuery(nextPage);
                                }}
                                color="violet"
                                radius="xl"
                            />
                        </Group>
                    )}
                </>
            )}

            {/* Confirmation Modal for Soft-Deleting a Song */}
            <Modal
                opened={Boolean(songPendingDelete)}
                onClose={() => {
                    if (!isDeletingSong) setSongPendingDelete(null);
                }}
                title={
                    <Group gap="xs">
                        <IconTrash size={19} color="#ef4444" />
                        <Text fw={700}>{i18n.card.deleteModalTitle}</Text>
                    </Group>
                }
                centered
                size="sm"
            >
                <Stack gap="md">
                    <Text size="sm">
                        {i18n.card.deleteModalConfirm}{' '}
                        <strong>&ldquo;{songPendingDelete?.name}&rdquo;</strong>?
                    </Text>

                    <Group justify="flex-end" gap="xs">
                        <Button
                            variant="subtle"
                            color="gray"
                            radius="xl"
                            disabled={isDeletingSong}
                            onClick={() => setSongPendingDelete(null)}
                        >
                            {i18n.card.deleteModalCancel}
                        </Button>
                        <Button
                            color="red"
                            radius="xl"
                            loading={isDeletingSong}
                            leftSection={<IconTrash size={15} />}
                            onClick={handleConfirmSoftDeleteSong}
                        >
                            {i18n.card.deleteModalAccept}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );
}
