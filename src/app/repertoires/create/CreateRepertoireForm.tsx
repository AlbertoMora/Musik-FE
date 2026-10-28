'use client';

import { ISongRes } from '@/domain/songs/song-gateway';
import { I18nTypes } from '@/i18n/dictionaries';
import { createRepertoireAction } from '@/infrastructure/adapters/repertoires/repertoires-actions';
import { getSongsByNameAction } from '@/infrastructure/adapters/songs/songs-actions';
import { getSlugifiedValue, removeChords } from '@/utils/text-utils';
import {
    ActionIcon,
    Badge,
    Button,
    Group,
    Loader,
    Modal,
    Stack,
    Text,
    TextInput,
    Title,
    Tooltip,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
    IconArrowDown,
    IconArrowUp,
    IconCancel,
    IconCheck,
    IconDeviceFloppy,
    IconExternalLink,
    IconEye,
    IconEyeOff,
    IconListCheck,
    IconMusic,
    IconPlaylistAdd,
    IconPlus,
    IconSearch,
    IconTrash,
} from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

interface CreateRepertoireFormProps {
    i18n: I18nTypes['repertoires']['create']['form'];
}

export default function CreateRepertoireForm({ i18n }: CreateRepertoireFormProps) {
    const router = useRouter();

    const [name, setName] = useState('');
    const [nameError, setNameError] = useState<string | null>(null);
    const [listError, setListError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ISongRes[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const [expandedPreviewIds, setExpandedPreviewIds] = useState<Record<string, boolean>>({});
    const [modalPreviewSong, setModalPreviewSong] = useState<ISongRes | null>(null);

    const [selectedSongs, setSelectedSongs] = useState<ISongRes[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedIdsSet = useMemo(
        () => new Set(selectedSongs.map(song => song.id)),
        [selectedSongs],
    );

    const performSearch = useDebouncedCallback(async (query: string) => {
        const trimmed = query.trim();
        if (trimmed.length < 2) {
            setSearchResults([]);
            setIsSearching(false);
            return;
        }

        setIsSearching(true);
        const res = await getSongsByNameAction(trimmed, 12, 0);
        if (res?.success && res.data?.songs) {
            setSearchResults(res.data.songs);
        } else {
            setSearchResults([]);
        }
        setIsSearching(false);
    }, 350);

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const val = event.currentTarget.value;
        setSearchQuery(val);
        if (val.trim().length >= 2) {
            setIsSearching(true);
        }
        performSearch(val);
    };

    const toggleInlinePreview = (songId: string) => {
        setExpandedPreviewIds(prev => ({
            ...prev,
            [songId]: !prev[songId],
        }));
    };

    const handleAddSong = (song: ISongRes) => {
        if (selectedIdsSet.has(song.id)) return;
        setSelectedSongs(prev => [...prev, song]);
        setListError(null);
    };

    const handleRemoveSong = (songId: string) => {
        setSelectedSongs(prev => prev.filter(s => s.id !== songId));
    };

    const handleMoveSong = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= selectedSongs.length) return;

        setSelectedSongs(prev => {
            const copy = [...prev];
            const [moved] = copy.splice(index, 1);
            copy.splice(targetIndex, 0, moved);
            return copy;
        });
    };

    const getCleanSnippet = (lyricsText: string, maxLines = 4) => {
        const cleaned = removeChords(lyricsText || '');
        const lines = cleaned
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);
        if (!lines.length) return '—';
        const snippet = lines.slice(0, maxLines).join('\n');
        return lines.length > maxLines ? `${snippet}\n...` : snippet;
    };

    const handleCreateRepertoire = async () => {
        const trimmedName = name.trim();
        let hasError = false;

        if (trimmedName.length < 3) {
            setNameError(i18n.nameMinLengthError);
            hasError = true;
        } else {
            setNameError(null);
        }

        if (selectedSongs.length === 0) {
            setListError(i18n.emptyLyricsError);
            hasError = true;
        } else {
            setListError(null);
        }

        if (hasError) return;

        setIsSubmitting(true);
        const lyricIds = selectedSongs.map(song => song.id);
        const res = await createRepertoireAction({
            name: trimmedName,
            lyrics: lyricIds,
        });
        setIsSubmitting(false);

        if (!res.success || !res.data) {
            notifications.show({
                title: i18n.errorTitle,
                message: i18n.errorMessage,
                color: 'red',
            });
            return;
        }

        notifications.show({
            title: i18n.successTitle,
            message: i18n.successMessage,
            color: 'teal',
        });

        setName('');
        setSelectedSongs([]);
        const targetSlug = res.data.slug || res.data.repertoireId;
        router.push(targetSlug ? `/repertoires/${targetSlug}` : '/my-repertoires');
    };

    return (
        <div className="form-container">
            {/* Repertoire Name Input */}
            <div className="mb-2">
                <TextInput
                    className="input-background"
                    size="md"
                    label={
                        <div className="flex items-center gap-2 mb-1">
                            <IconPlaylistAdd size={17} /> {i18n.nameLabel} *
                        </div>
                    }
                    placeholder={i18n.namePlaceholder}
                    value={name}
                    error={nameError}
                    onChange={e => {
                        setName(e.currentTarget.value);
                        if (nameError) setNameError(null);
                    }}
                />
            </div>

            {/* Two-column Builder */}
            <div className="repertoire-builder-grid">
                {/* Left Column: Song & Artist Search + Preview */}
                <div className="repertoire-panel">
                    <TextInput
                        className="input-background"
                        size="md"
                        label={
                            <div className="flex items-center gap-2 mb-1">
                                <IconSearch size={16} /> {i18n.searchLabel}
                            </div>
                        }
                        placeholder={i18n.searchPlaceholder}
                        value={searchQuery}
                        onChange={handleSearchChange}
                        rightSection={isSearching ? <Loader size="xs" /> : <IconSearch size={16} />}
                    />

                    {searchQuery.trim().length < 2 ? (
                        <div className="repertoire-empty-box">
                            <IconMusic size={36} stroke={1.5} />
                            <Text size="sm" maw={340}>
                                {i18n.searchEmptyHint}
                            </Text>
                        </div>
                    ) : isSearching ? (
                        <div className="repertoire-empty-box">
                            <Loader color="violet" />
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="repertoire-empty-box">
                            <IconMusic size={34} stroke={1.5} />
                            <Text size="sm">{i18n.noResults}</Text>
                        </div>
                    ) : (
                        <div className="repertoire-search-results">
                            {searchResults.map(song => {
                                const isAdded = selectedIdsSet.has(song.id);
                                const isExpanded = !!expandedPreviewIds[song.id];
                                const previewText = isExpanded
                                    ? removeChords(song.lyrics_text || '')
                                    : getCleanSnippet(song.lyrics_text || '', 3);

                                return (
                                    <div
                                        key={song.id}
                                        className={`repertoire-song-card ${isAdded ? 'is-selected' : ''}`}
                                    >
                                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                                            <div>
                                                <Group gap="xs" align="center">
                                                    <Text fw={700} size="md">
                                                        {song.name}
                                                    </Text>
                                                    <Text size="sm" c="dimmed">
                                                        {i18n.byLabel} {song.artist_name}
                                                    </Text>
                                                </Group>
                                                <Group gap={6} mt={4}>
                                                    {song.key && (
                                                        <Badge size="xs" variant="light" color="violet">
                                                            {i18n.keyBadge}: {song.key}
                                                        </Badge>
                                                    )}
                                                    {song.bpm > 0 && (
                                                        <Badge size="xs" variant="light" color="blue">
                                                            {song.bpm} {i18n.bpmBadge}
                                                        </Badge>
                                                    )}
                                                    {song.genre && (
                                                        <Badge size="xs" variant="light" color="grape">
                                                            {song.genre}
                                                        </Badge>
                                                    )}
                                                    {song.posted_by && (
                                                        <Text size="xs" c="dimmed">
                                                            ({i18n.postedByLabel} @{song.posted_by})
                                                        </Text>
                                                    )}
                                                </Group>
                                            </div>

                                            <Group gap="xs" wrap="nowrap">
                                                <Button
                                                    size="xs"
                                                    radius="xl"
                                                    variant="subtle"
                                                    color="gray"
                                                    leftSection={
                                                        isExpanded ? (
                                                            <IconEyeOff size={14} />
                                                        ) : (
                                                            <IconEye size={14} />
                                                        )
                                                    }
                                                    onClick={() => toggleInlinePreview(song.id)}
                                                >
                                                    {isExpanded
                                                        ? i18n.hidePreviewButton
                                                        : i18n.previewButton}
                                                </Button>

                                                <Button
                                                    size="xs"
                                                    radius="xl"
                                                    color={isAdded ? 'teal' : 'violet'}
                                                    variant={isAdded ? 'light' : 'filled'}
                                                    leftSection={
                                                        isAdded ? (
                                                            <IconCheck size={14} />
                                                        ) : (
                                                            <IconPlus size={14} />
                                                        )
                                                    }
                                                    onClick={() => handleAddSong(song)}
                                                    disabled={isAdded}
                                                >
                                                    {isAdded ? i18n.addedButton : i18n.addButton}
                                                </Button>
                                            </Group>
                                        </Group>

                                        {/* Brief Lyrics Preview */}
                                        <div
                                            className={`repertoire-song-preview-snippet ${
                                                isExpanded ? 'is-expanded' : ''
                                            }`}
                                        >
                                            {previewText}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Column: Selected Songs List */}
                <div className="repertoire-panel">
                    <Group justify="space-between" align="center">
                        <div>
                            <Group gap="xs" align="center">
                                <IconListCheck size={18} />
                                <Title order={4}>{i18n.selectedListTitle}</Title>
                                <Badge color="violet" variant="filled" radius="xl">
                                    {selectedSongs.length}
                                </Badge>
                            </Group>
                            <Text size="xs" c="dimmed" mt={2}>
                                {i18n.selectedListSubtitle}
                            </Text>
                        </div>
                    </Group>

                    {listError && (
                        <Text size="xs" c="red" fw={500}>
                            {listError}
                        </Text>
                    )}

                    {selectedSongs.length === 0 ? (
                        <div className="repertoire-empty-box">
                            <IconPlaylistAdd size={38} stroke={1.5} />
                            <Text size="sm" maw={320}>
                                {i18n.selectedEmpty}
                            </Text>
                        </div>
                    ) : (
                        <div className="repertoire-selected-list">
                            {selectedSongs.map((song, idx) => (
                                <div key={song.id} className="repertoire-selected-item">
                                    <Group gap="sm" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                                        <span className="repertoire-index-pill">{idx + 1}</span>
                                        <div style={{ minWidth: 0, flex: 1 }}>
                                            <Text fw={600} size="sm" truncate>
                                                {song.name}
                                            </Text>
                                            <Group gap={6}>
                                                <Text size="xs" c="dimmed" truncate>
                                                    {song.artist_name}
                                                </Text>
                                                {song.key && (
                                                    <Badge size="xs" variant="outline" color="violet">
                                                        {song.key}
                                                    </Badge>
                                                )}
                                            </Group>
                                        </div>
                                    </Group>

                                    <Group gap={4} wrap="nowrap">
                                        <Tooltip label={i18n.previewButton}>
                                            <ActionIcon
                                                variant="subtle"
                                                color="violet"
                                                onClick={() => setModalPreviewSong(song)}
                                            >
                                                <IconEye size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label={i18n.moveUp}>
                                            <ActionIcon
                                                variant="subtle"
                                                color="gray"
                                                disabled={idx === 0}
                                                onClick={() => handleMoveSong(idx, 'up')}
                                            >
                                                <IconArrowUp size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label={i18n.moveDown}>
                                            <ActionIcon
                                                variant="subtle"
                                                color="gray"
                                                disabled={idx === selectedSongs.length - 1}
                                                onClick={() => handleMoveSong(idx, 'down')}
                                            >
                                                <IconArrowDown size={16} />
                                            </ActionIcon>
                                        </Tooltip>
                                        <Tooltip label={i18n.remove}>
                                            <ActionIcon
                                                variant="subtle"
                                                color="red"
                                                onClick={() => handleRemoveSong(song.id)}
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
            </div>

            {/* Action Buttons */}
            <Group justify="flex-end" gap="md" mt="xl">
                <Button
                    component={Link}
                    href="/"
                    size="lg"
                    radius="xl"
                    variant="gradient"
                    leftSection={<IconCancel size={20} />}
                    gradient={{ from: 'red', to: 'magenta', deg: 161 }}
                >
                    {i18n.cancel}
                </Button>
                <Button
                    size="lg"
                    radius="xl"
                    variant="gradient"
                    gradient={{ from: 'blue', to: 'cyan', deg: 161 }}
                    leftSection={<IconDeviceFloppy size={20} />}
                    loading={isSubmitting}
                    onClick={handleCreateRepertoire}
                >
                    {isSubmitting ? i18n.saving : i18n.save}
                </Button>
            </Group>

            {/* Full Preview Modal */}
            <Modal
                opened={!!modalPreviewSong}
                onClose={() => setModalPreviewSong(null)}
                title={
                    modalPreviewSong ? (
                        <Group gap="xs">
                            <IconMusic size={18} />
                            <Text fw={700}>
                                {modalPreviewSong.name} — {modalPreviewSong.artist_name}
                            </Text>
                        </Group>
                    ) : (
                        i18n.previewTitle
                    )
                }
                size="lg"
                centered
            >
                {modalPreviewSong && (
                    <Stack gap="md">
                        <Group gap="xs">
                            {modalPreviewSong.key && (
                                <Badge color="violet" variant="light">
                                    {i18n.keyBadge}: {modalPreviewSong.key}
                                </Badge>
                            )}
                            {modalPreviewSong.bpm > 0 && (
                                <Badge color="blue" variant="light">
                                    {modalPreviewSong.bpm} {i18n.bpmBadge}
                                </Badge>
                            )}
                            {modalPreviewSong.genre && (
                                <Badge color="grape" variant="light">
                                    {modalPreviewSong.genre}
                                </Badge>
                            )}
                        </Group>
                        <div className="repertoire-song-preview-snippet is-expanded">
                            {removeChords(modalPreviewSong.lyrics_text || '')}
                        </div>
                        <Group justify="flex-end">
                            <Button
                                component={Link}
                                href={`/lyrics/${
                                    modalPreviewSong.slug ||
                                    getSlugifiedValue([
                                        modalPreviewSong.name,
                                        modalPreviewSong.artist_name,
                                        modalPreviewSong.posted_by,
                                    ])
                                }`}
                                target="_blank"
                                variant="light"
                                color="violet"
                                size="xs"
                                radius="xl"
                                rightSection={<IconExternalLink size={14} />}
                            >
                                {i18n.openFullSong}
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Modal>
        </div>
    );
}
