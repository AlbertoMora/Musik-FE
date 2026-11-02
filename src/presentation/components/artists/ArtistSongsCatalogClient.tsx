'use client';

import {
    IArtistModel,
    IArtistSongItemDTO,
    IArtistSongsFacetsDTO,
    IArtistSongsFilterParams,
} from '@/domain/artists/artist-gateway';
import { I18nTypes } from '@/i18n/dictionaries';
import { getArtistBySlugWithSongsAction } from '@/infrastructure/adapters/artists/artists-actions';
import { removeChords } from '@/utils/text-utils';
import {
    Avatar,
    Badge,
    Button,
    Collapse,
    Divider,
    Group,
    Loader,
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
    IconCheck,
    IconClock,
    IconDisc,
    IconFileText,
    IconFilterOff,
    IconGitFork,
    IconHeadphones,
    IconMicrophone,
    IconMusic,
    IconSearch,
    IconSortAscending,
    IconSortDescending,
    IconUser,
} from '@tabler/icons-react';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';

interface ArtistSongsCatalogClientProps {
    artist: IArtistModel;
    initialSongs: IArtistSongItemDTO[];
    initialCount: number;
    totalArtistSongs: number;
    facets: IArtistSongsFacetsDTO;
    i18n: I18nTypes['artists']['view'];
}

const PAGE_SIZE = 9;

type SortField = NonNullable<IArtistSongsFilterParams['sortBy']>;

export default function ArtistSongsCatalogClient({
    artist,
    initialSongs,
    initialCount,
    totalArtistSongs,
    facets,
    i18n,
}: ArtistSongsCatalogClientProps) {
    const [songs, setSongs] = useState<IArtistSongItemDTO[]>(initialSongs);
    const [totalCount, setTotalCount] = useState<number>(initialCount);
    const [page, setPage] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

    // Filter state for every column of `lyrics`
    const [name, setName] = useState('');
    const [lyricsText, setLyricsText] = useState('');
    const [genre, setGenre] = useState('');
    const [songKey, setSongKey] = useState('');
    const [bpmMin, setBpmMin] = useState('');
    const [bpmMax, setBpmMax] = useState('');
    const [hasSample, setHasSample] = useState<'all' | 'yes' | 'no'>('all');
    const [postedBy, setPostedBy] = useState('');
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
            postedBy.trim(),
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
        postedBy,
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
        overrides: Partial<IArtistSongsFilterParams> = {},
    ) => {
        setIsLoading(true);
        const offset = (targetPage - 1) * PAGE_SIZE;
        const payload: IArtistSongsFilterParams = {
            page: offset,
            limit: PAGE_SIZE,
            name: name.trim() || undefined,
            lyrics_text: lyricsText.trim() || undefined,
            genre: genre.trim() || undefined,
            key: songKey.trim() || undefined,
            bpmMin: bpmMin.trim() || undefined,
            bpmMax: bpmMax.trim() || undefined,
            hasSample,
            posted_by: postedBy.trim() || undefined,
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

        const res = await getArtistBySlugWithSongsAction(artist.slug || artist.id, payload);
        if (res.success && res.data) {
            setSongs(res.data.songs);
            setTotalCount(res.data.count);
        }
        setIsLoading(false);
    };

    const debouncedQuery = useDebouncedCallback((overrides: Partial<IArtistSongsFilterParams>) => {
        setPage(1);
        runQuery(1, overrides);
    }, 320);

    const handleClearAllFilters = () => {
        setName('');
        setLyricsText('');
        setGenre('');
        setSongKey('');
        setBpmMin('');
        setBpmMax('');
        setHasSample('all');
        setPostedBy('');
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
            posted_by: undefined,
            fork_of: undefined,
            album_id: undefined,
            creationDateFrom: undefined,
            creationDateTo: undefined,
            lastModifiedFrom: undefined,
            lastModifiedTo: undefined,
            id: undefined,
        });
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    const sortOptions = [
        { value: 'creation_date', label: i18n.fields.creation_date },
        { value: 'last_modified', label: i18n.fields.last_modified },
        { value: 'name', label: i18n.fields.name },
        { value: 'key', label: i18n.fields.key },
        { value: 'bpm', label: i18n.fields.bpm },
        { value: 'genre', label: i18n.fields.genre },
        { value: 'posted_by', label: i18n.fields.posted_by },
        { value: 'sample_uri', label: i18n.fields.sample_uri },
        { value: 'fork_of', label: i18n.fields.fork_of },
        { value: 'album_id', label: i18n.fields.album_id },
        { value: 'lyrics_text', label: i18n.fields.lyrics_text },
        { value: 'id', label: i18n.fields.id },
        { value: 'artist_id', label: i18n.fields.artist_id },
    ];

    return (
        <Stack gap='lg'>
            {/* Artist Profile Header */}
            <div className='repertoire-panel' style={{ minHeight: 'unset' }}>
                <Group justify='space-between' align='center' wrap='wrap' gap='md'>
                    <Group gap='md' wrap='nowrap' style={{ minWidth: 0 }}>
                        <Avatar src={artist.image_uri || null} size={68} radius='xl' color='violet'>
                            <IconMicrophone size={32} />
                        </Avatar>
                        <div style={{ minWidth: 0 }}>
                            <Group gap='xs' align='center' wrap='wrap'>
                                <Title order={2} lineClamp={1}>
                                    {artist.name}
                                </Title>
                                {artist.is_verified && (
                                    <Badge
                                        color='teal'
                                        variant='light'
                                        radius='xl'
                                        leftSection={<IconCheck size={12} />}>
                                        {i18n.verifiedBadge}
                                    </Badge>
                                )}
                            </Group>
                            {artist.description && (
                                <Text size='sm' c='dimmed' mt={4} maw={680}>
                                    {artist.description}
                                </Text>
                            )}
                            {artist.posted_by && (
                                <Text size='xs' c='dimmed' mt={4}>
                                    {i18n.postedByLabel}: @{artist.posted_by}
                                </Text>
                            )}
                        </div>
                    </Group>

                    <Group gap='xs'>
                        <Badge size='lg' color='violet' variant='light' radius='xl'>
                            {i18n.totalSongsBadge}: {totalArtistSongs}
                        </Badge>
                        <Badge size='lg' color='cyan' variant='outline' radius='xl'>
                            {i18n.matchingSongsBadge}: {totalCount}
                        </Badge>
                    </Group>
                </Group>
            </div>

            {/* Filters & Sorting Box (Every field of `lyrics`) */}
            <div className='repertoire-panel' style={{ minHeight: 'unset' }}>
                <Group justify='space-between' align='center' wrap='wrap' gap='sm'>
                    <Group gap='xs'>
                        <IconAdjustmentsHorizontal size={19} color='#a78bfa' />
                        <Text fw={700} size='sm'>
                            {i18n.filtersSectionTitle}
                        </Text>
                        {activeFilterCount > 0 && (
                            <Badge size='xs' color='violet' variant='filled' radius='xl'>
                                {activeFilterCount}
                            </Badge>
                        )}
                    </Group>

                    <Group gap='xs' wrap='wrap'>
                        <Select
                            size='xs'
                            radius='xl'
                            w={250}
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
                                size='xs'
                                radius='xl'
                                variant='light'
                                color='violet'
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
                                }}>
                                {sortDir}
                            </Button>
                        </Tooltip>

                        <Button
                            size='xs'
                            radius='xl'
                            variant='subtle'
                            color='gray'
                            onClick={() => setShowAdvanced(v => !v)}>
                            {showAdvanced ? i18n.hideAdvancedFilters : i18n.showAdvancedFilters}
                        </Button>

                        {activeFilterCount > 0 && (
                            <Button
                                size='xs'
                                radius='xl'
                                variant='subtle'
                                color='red'
                                leftSection={<IconFilterOff size={14} />}
                                onClick={handleClearAllFilters}>
                                {i18n.clearFiltersBtn}
                            </Button>
                        )}
                    </Group>
                </Group>

                {/* Primary Filters Row: name, lyrics_text, key, genre */}
                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing='sm'>
                    <TextInput
                        size='xs'
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
                        size='xs'
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
                        size='xs'
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

                    <Select
                        size='xs'
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
                </SimpleGrid>

                {/* Expandable Filters Row: bpm, sample_uri, posted_by, fork_of, album_id, creation_date, last_modified, id */}
                <Collapse in={showAdvanced}>
                    <Divider my='sm' />
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing='sm'>
                        <Group grow gap='xs' align='flex-end'>
                            <TextInput
                                size='xs'
                                type='number'
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
                                size='xs'
                                type='number'
                                label=' '
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
                            <Text size='xs' fw={500} mb={4}>
                                {i18n.fields.sample_uri}
                            </Text>
                            <SegmentedControl
                                fullWidth
                                size='xs'
                                color='violet'
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
                            size='xs'
                            clearable
                            searchable
                            label={i18n.fields.posted_by}
                            placeholder={i18n.placeholders.posted_by}
                            value={postedBy || null}
                            data={facets.postedByUsers.map(u => ({
                                value: u,
                                label: `@${u}`,
                            }))}
                            onChange={val => {
                                const nextVal = val || '';
                                setPostedBy(nextVal);
                                setPage(1);
                                runQuery(1, { posted_by: nextVal || undefined });
                            }}
                        />

                        <Select
                            size='xs'
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
                            size='xs'
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

                        <Group grow gap='xs' align='flex-end'>
                            <TextInput
                                size='xs'
                                type='date'
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
                                size='xs'
                                type='date'
                                label=' '
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

                        <Group grow gap='xs' align='flex-end'>
                            <TextInput
                                size='xs'
                                type='date'
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
                                size='xs'
                                type='date'
                                label=' '
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
                            size='xs'
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
                <div className='repertoire-empty-box'>
                    <Loader color='violet' />
                </div>
            ) : songs.length === 0 ? (
                <div className='repertoire-empty-box'>
                    <IconMusic size={44} stroke={1.5} />
                    <Title order={4}>{i18n.emptySongsTitle}</Title>
                    <Text size='sm' maw={420}>
                        {i18n.emptySongsDescription}
                    </Text>
                    {activeFilterCount > 0 && (
                        <Button
                            size='xs'
                            radius='xl'
                            color='violet'
                            variant='light'
                            leftSection={<IconFilterOff size={15} />}
                            onClick={handleClearAllFilters}>
                            {i18n.clearFiltersBtn}
                        </Button>
                    )}
                </div>
            ) : (
                <>
                    <div className='my-repertoires-grid'>
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
                                <div key={song.id} className='my-repertoire-card'>
                                    <Stack gap='xs'>
                                        <Group
                                            justify='space-between'
                                            align='flex-start'
                                            wrap='nowrap'>
                                            <Group
                                                gap='xs'
                                                wrap='nowrap'
                                                style={{ minWidth: 0, flex: 1 }}>
                                                <IconMusic size={20} color='#a78bfa' />
                                                <Title order={4} lineClamp={1}>
                                                    {song.name}
                                                </Title>
                                            </Group>

                                            {song.key && (
                                                <Badge color='violet' variant='filled' radius='xl'>
                                                    {i18n.card.keyLabel}: {song.key}
                                                </Badge>
                                            )}
                                        </Group>

                                        <Group gap={6} wrap='wrap'>
                                            {song.genre && (
                                                <Badge
                                                    size='xs'
                                                    color='grape'
                                                    variant='light'
                                                    radius='xl'>
                                                    {song.genre}
                                                </Badge>
                                            )}
                                            {Boolean(song.bpm) && (
                                                <Badge
                                                    size='xs'
                                                    color='indigo'
                                                    variant='outline'
                                                    radius='xl'>
                                                    {song.bpm} {i18n.card.bpmLabel}
                                                </Badge>
                                            )}
                                            {song.sample_uri && (
                                                <Badge
                                                    size='xs'
                                                    color='teal'
                                                    variant='light'
                                                    radius='xl'
                                                    leftSection={<IconHeadphones size={11} />}>
                                                    {i18n.card.hasAudioBadge}
                                                </Badge>
                                            )}
                                            {song.album_name && (
                                                <Badge
                                                    size='xs'
                                                    color='cyan'
                                                    variant='light'
                                                    radius='xl'
                                                    leftSection={<IconDisc size={11} />}>
                                                    {song.album_name}
                                                </Badge>
                                            )}
                                            {(song.fork_of_name || song.fork_of) && (
                                                <Badge
                                                    size='xs'
                                                    color='orange'
                                                    variant='light'
                                                    radius='xl'
                                                    leftSection={<IconGitFork size={11} />}>
                                                    {i18n.card.forkOfLabel}:{' '}
                                                    {song.fork_of_name || song.fork_of}
                                                </Badge>
                                            )}
                                        </Group>

                                        {cleanSnippet && (
                                            <div className='repertoire-song-preview-snippet'>
                                                {cleanSnippet}
                                            </div>
                                        )}

                                        <Group
                                            justify='space-between'
                                            align='center'
                                            wrap='wrap'
                                            gap={6}
                                            c='dimmed'>
                                            {song.posted_by && (
                                                <Group gap={4}>
                                                    <IconUser size={13} />
                                                    <Text size='xs'>
                                                        {i18n.card.postedByLabel} @{song.posted_by}
                                                    </Text>
                                                </Group>
                                            )}
                                            <Group gap={10}>
                                                {createdFormatted && (
                                                    <Group gap={4}>
                                                        <IconCalendar size={13} />
                                                        <Text size='xs'>
                                                            {i18n.card.createdLabel}:{' '}
                                                            {createdFormatted}
                                                        </Text>
                                                    </Group>
                                                )}
                                                {modifiedFormatted &&
                                                    modifiedFormatted !== createdFormatted && (
                                                        <Group gap={4}>
                                                            <IconClock size={13} />
                                                            <Text size='xs'>
                                                                {i18n.card.modifiedLabel}:{' '}
                                                                {modifiedFormatted}
                                                            </Text>
                                                        </Group>
                                                    )}
                                            </Group>
                                        </Group>
                                    </Stack>

                                    <Button
                                        component={Link}
                                        href={`/lyrics/${targetSlug}`}
                                        radius='xl'
                                        size='sm'
                                        color='violet'
                                        variant='light'
                                        fullWidth>
                                        {i18n.card.openSongBtn}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <Group justify='center' mt='xl'>
                            <Pagination
                                total={totalPages}
                                value={page}
                                onChange={nextPage => {
                                    setPage(nextPage);
                                    runQuery(nextPage);
                                }}
                                color='violet'
                                radius='xl'
                            />
                        </Group>
                    )}
                </>
            )}
        </Stack>
    );
}
