'use client';

import { ISongCommentItemDTO } from '@/domain/songs/song-gateway';
import { I18nTypes } from '@/i18n/dictionaries';
import {
    deleteSongCommentAction,
    getSongCommentsAction,
    postSongCommentAction,
} from '@/infrastructure/adapters/songs/songs-actions';
import {
    NotificationService,
    NotificationTypes,
} from '@/presentation/services/notification-service';
import { getSlugifiedValue } from '@/utils/text-utils';
import {
    ActionIcon,
    Avatar,
    Badge,
    Button,
    Divider,
    Group,
    Loader,
    Popover,
    Progress,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    Title,
    Tooltip,
} from '@mantine/core';
import {
    IconMessageCircle,
    IconMoodSmile,
    IconSend,
    IconStar,
    IconStarFilled,
    IconTrash,
} from '@tabler/icons-react';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';

const PLAIN_TEXT_AND_EMOJI_REGEX =
    /^[\p{L}\p{N}\p{M}\p{P}\p{Z}\p{Emoji}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Emoji_Component}\p{Extended_Pictographic}\u200d\ufe0f\n\r$+~^=]+$/u;

const EMOJI_PALETTE = [
    '🎵',
    '🎶',
    '🎸',
    '🎹',
    '🎤',
    '🥁',
    '🎻',
    '🎺',
    '🔥',
    '❤️',
    '💜',
    '👏',
    '🙌',
    '😍',
    '🤩',
    '🙏',
    '✨',
    '⭐',
    '🌟',
    '💯',
    '😊',
    '🥹',
    '🎉',
    '👍',
    '👌',
    '🕊️',
    '🎧',
    '🎼',
];

export const isValidPlainTextAndEmojis = (input: string): boolean => {
    if (!input || !input.trim()) return true;
    if (/[<>]/.test(input)) return false;
    if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(input)) return false;
    return PLAIN_TEXT_AND_EMOJI_REGEX.test(input);
};

interface ISongCommentsSectionProps {
    songId: string;
    initialAverageScore?: number;
    i18n: I18nTypes['lyrics']['text']['comments'];
    onRatingStatsChange?: (averageRating: number, totalComments: number) => void;
}

const StarRow = ({
    value,
    size = 16,
    interactive = false,
    onChange,
}: {
    value: number;
    size?: number;
    interactive?: boolean;
    onChange?: (nextVal: number) => void;
}) => {
    const [hoverVal, setHoverVal] = useState<number | null>(null);
    const displayVal = hoverVal ?? value;

    return (
        <Group gap={4} wrap="nowrap" onMouseLeave={() => interactive && setHoverVal(null)}>
            {[1, 2, 3, 4, 5].map(star => {
                const filled = star <= Math.round(displayVal);
                return (
                    <button
                        key={star}
                        type="button"
                        onClick={() => interactive && onChange?.(star)}
                        onMouseEnter={() => interactive && setHoverVal(star)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            padding: interactive ? 2 : 0,
                            margin: 0,
                            cursor: interactive ? 'pointer' : 'default',
                            display: 'inline-flex',
                            alignItems: 'center',
                            transform:
                                interactive && hoverVal === star ? 'scale(1.18)' : 'scale(1)',
                            transition: 'transform 120ms ease',
                        }}
                        aria-label={`${star} stars`}
                    >
                        {filled ? (
                            <IconStarFilled size={size} style={{ color: '#f59e0b' }} />
                        ) : (
                            <IconStar
                                size={size}
                                style={{ color: 'rgba(245, 158, 11, 0.45)' }}
                            />
                        )}
                    </button>
                );
            })}
        </Group>
    );
};

const SongCommentsSection: React.FC<ISongCommentsSectionProps> = ({
    songId,
    initialAverageScore = 0,
    i18n,
    onRatingStatsChange,
}) => {
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [comments, setComments] = useState<ISongCommentItemDTO[]>([]);
    const [averageRating, setAverageRating] = useState<number>(initialAverageScore || 0);
    const [totalComments, setTotalComments] = useState<number>(0);
    const [distribution, setDistribution] = useState<Record<number, number>>({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
    });

    const [rating, setRating] = useState<number>(5);
    const [commentText, setCommentText] = useState<string>('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [emojiPopoverOpened, setEmojiPopoverOpened] = useState<boolean>(false);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    const loadComments = useCallback(async () => {
        setLoading(true);
        const res = await getSongCommentsAction(songId);
        if (res.success && res.data) {
            setComments(res.data.comments || []);
            setAverageRating(res.data.averageRating ?? 0);
            setTotalComments(res.data.totalComments ?? 0);
            setDistribution(
                res.data.distribution ?? {
                    1: 0,
                    2: 0,
                    3: 0,
                    4: 0,
                    5: 0,
                },
            );
            onRatingStatsChange?.(res.data.averageRating ?? 0, res.data.totalComments ?? 0);
        }
        setLoading(false);
    }, [songId, onRatingStatsChange]);

    useEffect(() => {
        loadComments();
    }, [loadComments]);

    const handleCommentChange = (val: string) => {
        setCommentText(val);
        if (errorMsg) {
            setErrorMsg(null);
        }
    };

    const handleInsertEmoji = (emoji: string) => {
        const el = textareaRef.current;
        if (el) {
            const start = el.selectionStart ?? commentText.length;
            const end = el.selectionEnd ?? commentText.length;
            const next = `${commentText.slice(0, start)}${emoji}${commentText.slice(end)}`;
            setCommentText(next);
            setErrorMsg(null);
            setTimeout(() => {
                el.focus();
                el.setSelectionRange(start + emoji.length, start + emoji.length);
            }, 0);
        } else {
            setCommentText(prev => `${prev}${emoji}`);
            setErrorMsg(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (!rating || rating < 1 || rating > 5) {
            setErrorMsg(i18n.ratingRequiredError);
            return;
        }

        const trimmed = commentText.trim();
        if (!trimmed) {
            setErrorMsg(i18n.commentRequiredError);
            return;
        }

        if (!isValidPlainTextAndEmojis(trimmed)) {
            setErrorMsg(i18n.invalidCharsError);
            return;
        }

        setSubmitting(true);
        const res = await postSongCommentAction(songId, rating, trimmed);
        setSubmitting(false);

        if (!res.success || !res.data) {
            const msg =
                res.reason === 'auth05' ? i18n.loginRequiredNotice : i18n.postError;
            setErrorMsg(msg);
            NotificationService.showMessage(msg, NotificationTypes.error);
            return;
        }

        setComments(prev => [res.data!.comment, ...prev]);
        setAverageRating(res.data.averageRating);
        setTotalComments(res.data.totalComments);
        setDistribution(res.data.distribution);
        onRatingStatsChange?.(res.data.averageRating, res.data.totalComments);
        setCommentText('');
        setRating(5);
        NotificationService.showMessage(i18n.postSuccess, NotificationTypes.ok);
    };

    const handleDeleteComment = async (commentId: string) => {
        setDeletingId(commentId);
        const res = await deleteSongCommentAction(songId, commentId);
        setDeletingId(null);

        if (!res.success || !res.data) {
            NotificationService.showMessage(i18n.deleteError, NotificationTypes.error);
            return;
        }

        setComments(prev => prev.filter(c => c.id !== commentId));
        setAverageRating(res.data.averageRating);
        setTotalComments(res.data.totalComments);
        setDistribution(res.data.distribution);
        onRatingStatsChange?.(res.data.averageRating, res.data.totalComments);
        NotificationService.showMessage(i18n.deleteSuccess, NotificationTypes.ok);
    };

    const hasInvalidCharacters = Boolean(
        commentText.trim() && !isValidPlainTextAndEmojis(commentText),
    );

    return (
        <div
            style={{
                marginTop: '1.75rem',
                marginBottom: '3.5rem',
                padding: '1.5rem',
                borderRadius: 18,
                background: 'var(--song-info-bg)',
                border: '1px solid var(--song-info-border)',
                fontFamily: 'inherit',
            }}
        >
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between" align="center" wrap="wrap">
                    <Group gap="xs">
                        <IconMessageCircle size={22} style={{ color: '#a78bfa' }} />
                        <Title order={3} size="h4">
                            {i18n.title}
                        </Title>
                        <Badge variant="light" color="violet" radius="xl">
                            {totalComments}
                        </Badge>
                    </Group>
                    {averageRating > 0 && (
                        <Badge
                            size="lg"
                            radius="xl"
                            variant="light"
                            color="yellow"
                            leftSection={<IconStarFilled size={14} style={{ color: '#f59e0b' }} />}
                        >
                            {averageRating.toFixed(1)} / 5.0
                        </Badge>
                    )}
                </Group>

                {/* Summary + New Comment Grid */}
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                    {/* Left: Average Rating & Star Distribution */}
                    <div
                        style={{
                            padding: '1.25rem',
                            borderRadius: 14,
                            background: 'rgba(139, 92, 246, 0.05)',
                            border: '1px solid rgba(139, 92, 246, 0.16)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            gap: '1rem',
                        }}
                    >
                        <Group justify="space-between" align="center" wrap="wrap">
                            <div>
                                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                                    {i18n.averageLabel}
                                </Text>
                                <Group align="baseline" gap={8} mt={4}>
                                    <Text size="2.2rem" fw={800} lh={1}>
                                        {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        / 5.0
                                    </Text>
                                </Group>
                                <Box mt={6}>
                                    <StarRow value={averageRating} size={20} />
                                </Box>
                                <Text size="xs" c="dimmed" mt={6}>
                                    {totalComments > 0
                                        ? `${totalComments} ${i18n.reviewsCount}`
                                        : i18n.noReviewsYet}
                                </Text>
                            </div>

                            <Stack gap={6} style={{ flex: 1, minWidth: 170, maxWidth: 260 }}>
                                {[5, 4, 3, 2, 1].map(star => {
                                    const count = distribution[star] || 0;
                                    const pct =
                                        totalComments > 0
                                            ? Math.round((count / totalComments) * 100)
                                            : 0;
                                    return (
                                        <Group key={star} gap={8} wrap="nowrap">
                                            <Group gap={3} wrap="nowrap" style={{ width: 32 }}>
                                                <Text size="xs" fw={600}>
                                                    {star}
                                                </Text>
                                                <IconStarFilled
                                                    size={11}
                                                    style={{ color: '#f59e0b' }}
                                                />
                                            </Group>
                                            <Progress
                                                value={pct}
                                                color="yellow"
                                                size="sm"
                                                radius="xl"
                                                style={{ flex: 1 }}
                                            />
                                            <Text
                                                size="xs"
                                                c="dimmed"
                                                style={{ width: 26, textAlign: 'right' }}
                                            >
                                                {count}
                                            </Text>
                                        </Group>
                                    );
                                })}
                            </Stack>
                        </Group>
                    </div>

                    {/* Right: Leave Rating & Plain-Text + Emoji Comment Form */}
                    <form
                        onSubmit={handleSubmit}
                        style={{
                            padding: '1.25rem',
                            borderRadius: 14,
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid var(--song-info-border)',
                        }}
                    >
                        <Stack gap="sm">
                            <Text fw={700} size="sm">
                                {i18n.leaveReviewTitle}
                            </Text>

                            <Group justify="space-between" align="center" wrap="wrap">
                                <Text size="xs" c="dimmed" fw={600}>
                                    {i18n.ratingLabel}:
                                </Text>
                                <Group gap="xs">
                                    <StarRow
                                        value={rating}
                                        size={24}
                                        interactive
                                        onChange={setRating}
                                    />
                                    <Badge color="yellow" variant="light" radius="xl">
                                        {rating} / 5
                                    </Badge>
                                </Group>
                            </Group>

                            <div>
                                <Group justify="space-between" align="center" mb={4}>
                                    <Text size="xs" c="dimmed" fw={600}>
                                        {i18n.commentLabel}
                                    </Text>
                                    <Popover
                                        opened={emojiPopoverOpened}
                                        onChange={setEmojiPopoverOpened}
                                        position="bottom-end"
                                        withArrow
                                        shadow="md"
                                    >
                                        <Popover.Target>
                                            <Tooltip label={i18n.emojiPickerTooltip}>
                                                <ActionIcon
                                                    variant="light"
                                                    color="violet"
                                                    radius="xl"
                                                    size="sm"
                                                    type="button"
                                                    onClick={() =>
                                                        setEmojiPopoverOpened(o => !o)
                                                    }
                                                >
                                                    <IconMoodSmile size={16} />
                                                </ActionIcon>
                                            </Tooltip>
                                        </Popover.Target>
                                        <Popover.Dropdown
                                            style={{
                                                maxWidth: 260,
                                                background: 'var(--song-container-bg)',
                                                border: '1px solid var(--song-container-border)',
                                            }}
                                        >
                                            <Group gap={6} wrap="wrap">
                                                {EMOJI_PALETTE.map(emoji => (
                                                    <ActionIcon
                                                        key={emoji}
                                                        variant="subtle"
                                                        size="md"
                                                        radius="md"
                                                        type="button"
                                                        onClick={() => {
                                                            handleInsertEmoji(emoji);
                                                            setEmojiPopoverOpened(false);
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '1.1rem' }}>
                                                            {emoji}
                                                        </span>
                                                    </ActionIcon>
                                                ))}
                                            </Group>
                                        </Popover.Dropdown>
                                    </Popover>
                                </Group>

                                <Textarea
                                    ref={textareaRef}
                                    placeholder={i18n.commentPlaceholder}
                                    value={commentText}
                                    onChange={e => handleCommentChange(e.currentTarget.value)}
                                    minRows={3}
                                    maxRows={5}
                                    maxLength={1000}
                                    error={
                                        hasInvalidCharacters
                                            ? i18n.invalidCharsError
                                            : errorMsg
                                    }
                                />
                                <Group justify="flex-end" mt={4}>
                                    <Text size="xs" c="dimmed">
                                        {commentText.length}/1000
                                    </Text>
                                </Group>
                            </div>

                            <Group justify="flex-end">
                                <Button
                                    type="submit"
                                    size="xs"
                                    radius="xl"
                                    variant="gradient"
                                    gradient={{ from: 'violet', to: 'grape', deg: 135 }}
                                    leftSection={<IconSend size={14} />}
                                    loading={submitting}
                                    disabled={hasInvalidCharacters}
                                >
                                    {submitting ? i18n.submitting : i18n.submitButton}
                                </Button>
                            </Group>
                        </Stack>
                    </form>
                </SimpleGrid>

                <Divider style={{ borderColor: 'var(--song-info-border)' }} />

                {/* Comments List */}
                {loading ? (
                    <Group justify="center" py="md">
                        <Loader color="violet" size="sm" />
                    </Group>
                ) : comments.length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                        {i18n.emptyComments}
                    </Text>
                ) : (
                    <Stack gap="sm">
                        {comments.map(item => {
                            const editorSlug =
                                item.userSlug || getSlugifiedValue([item.username || 'user']);
                            return (
                                <div
                                    key={item.id}
                                    style={{
                                        padding: '0.9rem 1.1rem',
                                        borderRadius: 12,
                                        background: 'rgba(255, 255, 255, 0.02)',
                                        border: '1px solid var(--song-info-border)',
                                    }}
                                >
                                    <Group justify="space-between" align="flex-start" wrap="nowrap">
                                        <Group gap="sm" align="center" wrap="nowrap">
                                            <Avatar
                                                src={item.userAvatar || null}
                                                radius="xl"
                                                size="md"
                                                color="violet"
                                            >
                                                {(item.username || 'U')
                                                    .slice(0, 2)
                                                    .toUpperCase()}
                                            </Avatar>
                                            <div>
                                                <Group gap={8} align="center">
                                                    <Link
                                                        href={`/editors/${editorSlug}`}
                                                        style={{
                                                            fontWeight: 700,
                                                            fontSize: '0.9rem',
                                                            textDecoration: 'none',
                                                        }}
                                                    >
                                                        @{item.username}
                                                    </Link>
                                                    <StarRow value={item.rating} size={14} />
                                                    <Badge
                                                        size="xs"
                                                        color="yellow"
                                                        variant="light"
                                                        radius="xl"
                                                    >
                                                        {Number(item.rating).toFixed(1)}
                                                    </Badge>
                                                </Group>
                                                <Text size="xs" c="dimmed">
                                                    {item.createdAt
                                                        ? new Date(
                                                              item.createdAt,
                                                          ).toLocaleString()
                                                        : ''}
                                                </Text>
                                            </div>
                                        </Group>

                                        {item.isOwn && (
                                            <Tooltip label={i18n.deleteTooltip}>
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="red"
                                                    radius="xl"
                                                    size="sm"
                                                    loading={deletingId === item.id}
                                                    onClick={() => handleDeleteComment(item.id)}
                                                >
                                                    <IconTrash size={15} />
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                    </Group>

                                    <Text
                                        size="sm"
                                        mt="xs"
                                        style={{
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-word',
                                            lineHeight: 1.5,
                                        }}
                                    >
                                        {item.comment}
                                    </Text>
                                </div>
                            );
                        })}
                    </Stack>
                )}
            </Stack>
        </div>
    );
};

const Box = ({
    children,
    mt,
}: {
    children: React.ReactNode;
    mt?: number;
}) => <div style={{ marginTop: mt }}>{children}</div>;

export default SongCommentsSection;
