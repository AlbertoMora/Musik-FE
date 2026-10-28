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
    Group,
    Loader,
    Pagination,
    Stack,
    Text,
    TextInput,
    Title,
    Tooltip,
} from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
    IconCalendar,
    IconMusic,
    IconPlaylist,
    IconPlus,
    IconSearch,
    IconTrash,
} from '@tabler/icons-react';
import Link from 'next/link';
import React, { useState } from 'react';

interface MyRepertoiresClientProps {
    initialRepertoires: IRepertoireDTO[];
    initialCount: number;
    i18n: I18nTypes['repertoires']['myRepertoires'];
}

const PAGE_SIZE = 9;

export default function MyRepertoiresClient({
    initialRepertoires,
    initialCount,
    i18n,
}: MyRepertoiresClientProps) {
    const [repertoires, setRepertoires] = useState<IRepertoireDTO[]>(initialRepertoires);
    const [totalCount, setTotalCount] = useState<number>(initialCount);
    const [page, setPage] = useState<number>(1);
    const [search, setSearch] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchPage = async (targetPage: number, query: string) => {
        setIsLoading(true);
        const offset = (targetPage - 1) * PAGE_SIZE;
        const res = await getRepertoiresAction(offset, PAGE_SIZE, query.trim() || undefined);
        if (res.success && res.data) {
            setRepertoires(res.data.repertoires);
            setTotalCount(res.data.count);
        }
        setIsLoading(false);
    };

    const debouncedSearch = useDebouncedCallback((val: string) => {
        setPage(1);
        fetchPage(1, val);
    }, 350);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.currentTarget.value;
        setSearch(val);
        debouncedSearch(val);
    };

    const handlePageChange = (nextPage: number) => {
        setPage(nextPage);
        fetchPage(nextPage, search);
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

        fetchPage(page, search);
    };

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    return (
        <div className="mt-4">
            <Group justify="space-between" align="center" wrap="wrap" gap="md">
                <TextInput
                    className="input-background"
                    style={{ flex: '1 1 320px', maxWidth: 460 }}
                    placeholder={i18n.searchPlaceholder}
                    value={search}
                    onChange={handleSearchChange}
                    leftSection={<IconSearch size={16} />}
                    rightSection={isLoading ? <Loader size="xs" /> : null}
                />

                <Button
                    component={Link}
                    href="/repertoires/create"
                    radius="xl"
                    size="md"
                    variant="gradient"
                    gradient={{ from: 'violet', to: 'grape', deg: 145 }}
                    leftSection={<IconPlus size={18} />}
                >
                    {i18n.createButton}
                </Button>
            </Group>

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
                    <div className="my-repertoires-grid">
                        {repertoires.map(rep => {
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
                                                <IconPlaylist size={22} color="#a78bfa" />
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

                                        {formattedDate && (
                                            <Group gap={6} c="dimmed">
                                                <IconCalendar size={14} />
                                                <Text size="xs">
                                                    {i18n.updatedLabel} {formattedDate}
                                                </Text>
                                            </Group>
                                        )}
                                    </Stack>

                                    <Group justify="space-between" align="center" mt="xs">
                                        <Button
                                            component={Link}
                                            href={`/repertoires/${targetSlug}`}
                                            radius="xl"
                                            size="sm"
                                            color="violet"
                                            variant="light"
                                            style={{ flex: 1 }}
                                        >
                                            {i18n.openButton}
                                        </Button>

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
                                onChange={handlePageChange}
                                color="violet"
                                radius="xl"
                            />
                        </Group>
                    )}
                </>
            )}
        </div>
    );
}
