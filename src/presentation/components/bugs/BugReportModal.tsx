'use client';

import React, { useRef, useState } from 'react';
import {
    Alert,
    Badge,
    Button,
    Group,
    Modal,
    Progress,
    Stack,
    Text,
    Textarea,
    TextInput,
    ActionIcon,
} from '@mantine/core';
import {
    IconBug,
    IconCheck,
    IconFileUpload,
    IconPhoto,
    IconSparkles,
    IconTrash,
    IconVideo,
    IconX,
} from '@tabler/icons-react';
import {
    createBugReportAction,
    getBugPresignedUploadAction,
    IBugMediaDTO,
} from '@/infrastructure/adapters/bugs/bugs-actions';
import { controlledFileUploadRequest } from '@/utils/web-utils';
import { BrokenNoteRepairSvg } from './BrokenNoteRepairSvg';
import { NotificationsService } from '@/presentation/services/notification-service';

import esDict from '@/i18n/es.json';
import enDict from '@/i18n/en.json';

const MAX_TOTAL_BYTES = 50 * 1024 * 1024; // 50 MB

export interface BugReportModalTexts {
    modalTitle: string;
    friendlyNoticeTitle: string;
    friendlyNoticeBody: string;
    titleLabel: string;
    titlePlaceholder: string;
    contentLabel: string;
    contentPlaceholder: string;
    mediaLabel: string;
    mediaDropzoneCaption: string;
    mediaSubCaption: string;
    submitButton: string;
    cancelButton: string;
    publishingTitle: string;
    publishingSub: string;
    successTitle: string;
    successMessage: string;
    errorTitle: string;
    errorSizeLimit: string;
    errorInvalidFields: string;
    errorUploadFailed: string;
}

const DEFAULT_TEXTS_ES: BugReportModalTexts = esDict.app.footer.bugReportModal;
const DEFAULT_TEXTS_EN: BugReportModalTexts = enDict.app.footer.bugReportModal;

interface BugReportModalProps {
    opened: boolean;
    onClose: () => void;
    texts?: Partial<BugReportModalTexts>;
}

export const BugReportModal: React.FC<BugReportModalProps> = ({ opened, onClose, texts }) => {
    const isEnglishBrowser =
        typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('en');
    const baseLocaleTexts = isEnglishBrowser ? DEFAULT_TEXTS_EN : DEFAULT_TEXTS_ES;
    const t: BugReportModalTexts = { ...baseLocaleTexts, ...texts };

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
    const totalMb = (totalBytes / (1024 * 1024)).toFixed(2);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setFiles([]);
        setIsDragging(false);
        setIsPublishing(false);
        setUploadProgress(0);
    };

    const handleClose = () => {
        if (isPublishing) return;
        resetForm();
        onClose();
    };

    const addSelectedFiles = (incomingList: FileList | null) => {
        if (!incomingList || incomingList.length === 0) return;

        const validIncoming: File[] = [];
        let runningTotal = totalBytes;

        for (let i = 0; i < incomingList.length; i++) {
            const file = incomingList[i];
            if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
                continue;
            }
            if (runningTotal + file.size > MAX_TOTAL_BYTES) {
                NotificationsService.error({
                    title: t.errorTitle,
                    message: t.errorSizeLimit,
                });
                return;
            }
            runningTotal += file.size;
            validIncoming.push(file);
        }

        if (validIncoming.length > 0) {
            setFiles(prev => [...prev, ...validIncoming]);
        }
    };

    const removeFileAt = (index: number) => {
        setFiles(prev => prev.filter((_, idx) => idx !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim()) {
            NotificationsService.error({
                title: t.errorTitle,
                message: t.errorInvalidFields,
            });
            return;
        }

        if (totalBytes > MAX_TOTAL_BYTES) {
            NotificationsService.error({
                title: t.errorTitle,
                message: t.errorSizeLimit,
            });
            return;
        }

        setIsPublishing(true);
        setUploadProgress(5);

        try {
            const uploadedMedia: IBugMediaDTO[] = [];

            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    const presignedRes = await getBugPresignedUploadAction(file.name, file.type);

                    if (!presignedRes.success || !presignedRes.data?.url) {
                        throw new Error('Failed to get presigned URL');
                    }

                    const { url, key } = presignedRes.data;

                    await controlledFileUploadRequest(url, file, filePercent => {
                        const overall = ((i + filePercent / 100) / files.length) * 85 + 5;
                        setUploadProgress(Math.min(92, Math.round(overall)));
                    });

                    uploadedMedia.push({
                        key,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                    });
                }
            } else {
                setUploadProgress(65);
            }

            // Guarantee a brief minimum display so the user can appreciate the broken note repairing SVG loop
            await new Promise(resolve => setTimeout(resolve, 1400));

            const createRes = await createBugReportAction({
                title: title.trim(),
                description: description.trim(),
                media: uploadedMedia,
            });

            if (!createRes.success) {
                throw new Error('Failed to create bug report');
            }

            setUploadProgress(100);
            NotificationsService.success({
                title: t.successTitle,
                message: t.successMessage,
            });

            resetForm();
            onClose();
        } catch (err) {
            console.error('Error submitting bug report:', err);
            NotificationsService.error({
                title: t.errorTitle,
                message: t.errorUploadFailed,
            });
            setIsPublishing(false);
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={handleClose}
            centered
            size='lg'
            radius='md'
            closeOnClickOutside={!isPublishing}
            closeOnEscape={!isPublishing}
            withCloseButton={!isPublishing}
            title={
                <Group gap='xs'>
                    <IconBug size={22} color='#ef4444' />
                    <Text fw={700} size='lg'>
                        {t.modalTitle}
                    </Text>
                </Group>
            }>
            {isPublishing ? (
                <Stack align='center' justify='center' py='xl' gap='md'>
                    <BrokenNoteRepairSvg size={165} />
                    <Text fw={700} size='lg' ta='center'>
                        {t.publishingTitle}
                    </Text>
                    <Text size='sm' c='dimmed' ta='center'>
                        {t.publishingSub}
                    </Text>
                    <div style={{ width: '85%', marginTop: 8 }}>
                        <Progress
                            value={uploadProgress}
                            color='red'
                            size='md'
                            radius='xl'
                            striped
                            animated
                        />
                        <Text size='xs' c='dimmed' ta='center' mt={6}>
                            {uploadProgress}%
                        </Text>
                    </div>
                </Stack>
            ) : (
                <form onSubmit={handleSubmit}>
                    <Stack gap='md'>
                        <Alert
                            variant='light'
                            color='grape'
                            radius='md'
                            title={t.friendlyNoticeTitle}
                            icon={<IconSparkles size={20} />}>
                            <Text size='xs' lh={1.55}>
                                {t.friendlyNoticeBody}
                            </Text>
                        </Alert>

                        <TextInput
                            label={t.titleLabel}
                            placeholder={t.titlePlaceholder}
                            value={title}
                            onChange={e => setTitle(e.currentTarget.value)}
                            required
                            maxLength={255}
                        />

                        <Textarea
                            label={t.contentLabel}
                            placeholder={t.contentPlaceholder}
                            value={description}
                            onChange={e => setDescription(e.currentTarget.value)}
                            minRows={4}
                            autosize
                            required
                            maxLength={4000}
                        />

                        <div>
                            <Group justify='space-between' mb={6}>
                                <Text size='sm' fw={500}>
                                    {t.mediaLabel}
                                </Text>
                                <Badge
                                    color={totalBytes > MAX_TOTAL_BYTES * 0.9 ? 'red' : 'gray'}
                                    variant='light'>
                                    {totalMb} MB / 50.00 MB
                                </Badge>
                            </Group>

                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={e => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={e => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    addSelectedFiles(e.dataTransfer.files);
                                }}
                                style={{
                                    border: `2px dashed ${isDragging ? '#ef4444' : 'rgba(148, 163, 184, 0.4)'}`,
                                    borderRadius: 12,
                                    padding: '22px 16px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: isDragging
                                        ? 'rgba(239, 68, 68, 0.08)'
                                        : 'rgba(15, 23, 42, 0.25)',
                                    transition: 'all 0.2s ease',
                                }}>
                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    multiple
                                    accept='image/*,video/*'
                                    style={{ display: 'none' }}
                                    onChange={e => {
                                        addSelectedFiles(e.target.files);
                                        e.target.value = '';
                                    }}
                                />
                                <Stack align='center' gap={6}>
                                    <IconFileUpload size={34} color='#ef4444' />
                                    <Text size='sm' fw={600}>
                                        {t.mediaDropzoneCaption}
                                    </Text>
                                    <Text size='xs' c='dimmed'>
                                        {t.mediaSubCaption}
                                    </Text>
                                </Stack>
                            </div>

                            {files.length > 0 && (
                                <Stack gap='xs' mt='sm'>
                                    {files.map((file, idx) => (
                                        <Group
                                            key={`${file.name}-${idx}`}
                                            justify='space-between'
                                            p='xs'
                                            style={{
                                                borderRadius: 8,
                                                border: '1px solid rgba(148, 163, 184, 0.25)',
                                            }}>
                                            <Group gap='xs' style={{ overflow: 'hidden' }}>
                                                {file.type.startsWith('video/') ? (
                                                    <IconVideo size={18} color='#f43f5e' />
                                                ) : (
                                                    <IconPhoto size={18} color='#10b981' />
                                                )}
                                                <Text
                                                    size='sm'
                                                    truncate
                                                    style={{ maxWidth: 300 }}
                                                    title={file.name}>
                                                    {file.name}
                                                </Text>
                                                <Badge size='xs' variant='outline'>
                                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                                </Badge>
                                            </Group>
                                            <ActionIcon
                                                color='red'
                                                variant='subtle'
                                                onClick={() => removeFileAt(idx)}
                                                aria-label='Eliminar archivo'>
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Group>
                                    ))}
                                </Stack>
                            )}
                        </div>

                        <Group justify='flex-end' mt='md'>
                            <Button
                                type='button'
                                variant='subtle'
                                color='gray'
                                leftSection={<IconX size={16} />}
                                onClick={handleClose}>
                                {t.cancelButton}
                            </Button>
                            <Button
                                type='submit'
                                color='red'
                                leftSection={<IconCheck size={16} />}>
                                {t.submitButton}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            )}
        </Modal>
    );
};
