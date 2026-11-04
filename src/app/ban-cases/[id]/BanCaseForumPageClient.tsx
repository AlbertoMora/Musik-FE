'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Badge,
    Button,
    Card,
    Container,
    Divider,
    Group,
    Loader,
    Paper,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    TextInput,
    Title,
} from '@mantine/core';
import {
    IconBan,
    IconCheck,
    IconExternalLink,
    IconFileUpload,
    IconGavel,
    IconPhoto,
    IconSend,
    IconShieldCheck,
    IconVideo,
} from '@tabler/icons-react';
import { ILocalSessionData } from '@/domain/auth/auth-gateway';
import {
    getBanCaseDetailServerAction,
    getBanCasePresignedUploadServerAction,
    IBanCaseDTO,
    IBanForumMessageDTO,
    postBanCaseMessageServerAction,
    resolveBanCaseServerAction,
} from '@/infrastructure/adapters/admin/admin-actions';
import { IBugMediaDTO } from '@/infrastructure/adapters/bugs/bugs-actions';
import { controlledFileUploadRequest } from '@/utils/web-utils';
import { NotificationsService } from '@/presentation/services/notification-service';

interface BanCaseForumPageClientProps {
    caseId: string;
    sessionUser: ILocalSessionData['user'];
}

const VERDICT_BADGE_COLORS: Record<string, string> = {
    open: 'yellow',
    Baneado: 'red',
    Indultado: 'teal',
    'No Procede': 'gray',
};

const BanCaseForumPageClient: React.FC<BanCaseForumPageClientProps> = ({ caseId }) => {
    const [banCase, setBanCase] = useState<IBanCaseDTO | null>(null);
    const [messages, setMessages] = useState<IBanForumMessageDTO[]>([]);
    const [canResolve, setCanResolve] = useState(false);
    const [loading, setLoading] = useState(true);
    const [forbidden, setForbidden] = useState(false);

    const [replyText, setReplyText] = useState('');
    const [replyFiles, setReplyFiles] = useState<File[]>([]);
    const [sending, setSending] = useState(false);
    const [resolutionNote, setResolutionNote] = useState('');
    const [resolving, setResolving] = useState(false);

    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const loadCase = useCallback(async () => {
        setLoading(true);
        const res = await getBanCaseDetailServerAction(caseId);
        if (res.success && res.data) {
            setBanCase(res.data.banCase);
            setMessages(res.data.messages || []);
            setCanResolve(Boolean(res.data.canResolve));
            setForbidden(false);
        } else {
            setForbidden(true);
        }
        setLoading(false);
    }, [caseId]);

    useEffect(() => {
        loadCase();
    }, [loadCase]);

    const uploadFilesToS3 = async (fileList: File[]): Promise<IBugMediaDTO[]> => {
        const uploaded: IBugMediaDTO[] = [];
        for (const file of fileList) {
            const presigned = await getBanCasePresignedUploadServerAction(file.name, file.type);
            if (!presigned.success || !presigned.data?.url) {
                throw new Error('Could not get presigned URL');
            }
            await controlledFileUploadRequest(presigned.data.url, file, () => {});
            uploaded.push({
                key: presigned.data.key,
                name: file.name,
                type: file.type,
                size: file.size,
            });
        }
        return uploaded;
    };

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!banCase) return;
        if (!replyText.trim() && replyFiles.length === 0) return;

        setSending(true);
        try {
            const media = await uploadFilesToS3(replyFiles);
            const res = await postBanCaseMessageServerAction(banCase.id, {
                message: replyText.trim() || 'Evidencia adjunta',
                media,
            });
            if (res.success && res.data?.message) {
                setMessages(prev => [...prev, res.data!.message]);
                setReplyText('');
                setReplyFiles([]);
                NotificationsService.success({
                    title: 'Publicado',
                    message: 'Tu mensaje y pruebas se agregaron al foro.',
                });
            }
        } catch {
            NotificationsService.error({
                title: 'Error',
                message: 'No se pudo enviar tu mensaje.',
            });
        } finally {
            setSending(false);
        }
    };

    const handleVerdict = async (verdict: 'Baneado' | 'Indultado' | 'No Procede') => {
        if (!banCase) return;
        setResolving(true);
        const res = await resolveBanCaseServerAction(banCase.id, {
            verdict,
            resolutionNote: resolutionNote.trim() || undefined,
        });
        setResolving(false);

        if (res.success) {
            NotificationsService.success({
                title: `Caso cerrado: ${verdict}`,
                message: `El foro se ha cerrado con veredicto "${verdict}".`,
            });
            loadCase();
        }
    };

    if (loading) {
        return (
            <Container size='md' py='xl'>
                <Stack align='center' py='xl'>
                    <Loader color='grape' />
                    <Text size='sm' c='dimmed'>
                        Cargando foro del caso...
                    </Text>
                </Stack>
            </Container>
        );
    }

    if (forbidden || !banCase) {
        return (
            <Container size='md' py='xl'>
                <Card withBorder radius='md' p='xl' ta='center'>
                    <Stack align='center' gap='sm'>
                        <IconGavel size={42} color='#ef4444' />
                        <Title order={3}>Acceso Restringido</Title>
                        <Text size='sm' c='dimmed'>
                            Sólo el usuario que reporta, el usuario reportado y los administradores pueden acceder a este ticket del foro.
                        </Text>
                    </Stack>
                </Card>
            </Container>
        );
    }

    return (
        <Container size='lg' py='xl'>
            <Stack gap='lg'>
                <Card withBorder radius='lg' p='xl'>
                    <Group justify='space-between' mb='sm'>
                        <Group gap='xs'>
                            <IconGavel size={24} color='#a78bfa' />
                            <Title order={2}>{banCase.title || 'Expediente de Moderación'}</Title>
                        </Group>
                        <Badge
                            size='lg'
                            color={VERDICT_BADGE_COLORS[banCase.status] || 'yellow'}
                            variant='filled'>
                            {banCase.status === 'open'
                                ? 'Foro Abierto'
                                : `Cerrado: ${banCase.status}`}
                        </Badge>
                    </Group>

                    <Text size='sm' c='dimmed' mb='md'>
                        {banCase.player_report}
                    </Text>

                    <Group gap='sm'>
                        <Badge color='red' variant='light'>
                            Reportado: @{banCase.banned_player?.username || banCase.banned_player_id}
                        </Badge>
                        <Badge color='blue' variant='light'>
                            Reporta: @{banCase.reported_by_player?.username || banCase.reported_by_player_id}
                        </Badge>
                    </Group>
                </Card>

                <Stack gap='md'>
                    {messages.map(msg => (
                        <Card key={msg._id} withBorder radius='md' p='md'>
                            <Group justify='space-between' mb={6}>
                                <Group gap='xs'>
                                    <Text fw={700} size='sm'>
                                        @{msg.senderUsername}
                                    </Text>
                                    <Badge
                                        size='xs'
                                        color={
                                            msg.senderRole === 'admin'
                                                ? 'grape'
                                                : msg.senderRole === 'reported'
                                                  ? 'orange'
                                                  : 'blue'
                                        }
                                        variant='light'>
                                        {msg.senderRole === 'admin'
                                            ? 'Admin'
                                            : msg.senderRole === 'reported'
                                              ? 'Reportado (Defensa)'
                                              : 'Reportante'}
                                    </Badge>
                                </Group>
                                <Text size='xs' c='dimmed'>
                                    {new Date(msg.createdAt).toLocaleString()}
                                </Text>
                            </Group>

                            <Text size='sm' style={{ whiteSpace: 'pre-wrap' }}>
                                {msg.message}
                            </Text>

                            {Array.isArray(msg.media) && msg.media.length > 0 && (
                                <SimpleGrid cols={{ base: 1, sm: 2 }} mt='sm' spacing='xs'>
                                    {msg.media.map((m, i) => (
                                        <Paper key={`${m.key}-${i}`} withBorder p='xs' radius='sm'>
                                            {m.type?.startsWith('video/') ? (
                                                m.url ? (
                                                    <video
                                                        src={m.url}
                                                        controls
                                                        style={{
                                                            width: '100%',
                                                            maxHeight: 180,
                                                            borderRadius: 6,
                                                        }}
                                                    />
                                                ) : (
                                                    <Group gap='xs'>
                                                        <IconVideo size={16} />
                                                        <Text size='xs'>{m.name}</Text>
                                                    </Group>
                                                )
                                            ) : m.url ? (
                                                <img
                                                    src={m.url}
                                                    alt={m.name}
                                                    style={{
                                                        width: '100%',
                                                        maxHeight: 180,
                                                        objectFit: 'cover',
                                                        borderRadius: 6,
                                                    }}
                                                />
                                            ) : (
                                                <Group gap='xs'>
                                                    <IconPhoto size={16} />
                                                    <Text size='xs'>{m.name}</Text>
                                                </Group>
                                            )}
                                            {m.url && (
                                                <Button
                                                    component='a'
                                                    href={m.url}
                                                    target='_blank'
                                                    rel='noreferrer'
                                                    size='compact-xs'
                                                    variant='subtle'
                                                    mt={4}
                                                    rightSection={<IconExternalLink size={12} />}>
                                                    Ver Evidencia
                                                </Button>
                                            )}
                                        </Paper>
                                    ))}
                                </SimpleGrid>
                            )}
                        </Card>
                    ))}
                </Stack>

                {banCase.status === 'open' && (
                    <Card withBorder radius='md' p='md'>
                        <form onSubmit={handleSendReply}>
                            <Stack gap='sm'>
                                <Textarea
                                    label='Agregar pruebas o contraevidencia'
                                    placeholder='Escribe tu argumento o adjunta capturas/videos...'
                                    value={replyText}
                                    onChange={e => setReplyText(e.currentTarget.value)}
                                    minRows={3}
                                    autosize
                                />
                                <Group justify='space-between'>
                                    <Button
                                        type='button'
                                        size='xs'
                                        variant='light'
                                        leftSection={<IconFileUpload size={14} />}
                                        onClick={() => fileInputRef.current?.click()}>
                                        Adjuntar Archivos ({replyFiles.length})
                                    </Button>
                                    <input
                                        ref={fileInputRef}
                                        type='file'
                                        multiple
                                        accept='image/*,video/*'
                                        style={{ display: 'none' }}
                                        onChange={e => {
                                            if (e.target.files) {
                                                setReplyFiles(prev => [
                                                    ...prev,
                                                    ...Array.from(e.target.files!),
                                                ]);
                                            }
                                            e.target.value = '';
                                        }}
                                    />
                                    <Button
                                        type='submit'
                                        size='xs'
                                        color='blue'
                                        loading={sending}
                                        leftSection={<IconSend size={14} />}>
                                        Publicar en el Foro
                                    </Button>
                                </Group>
                            </Stack>
                        </form>
                    </Card>
                )}

                {canResolve && (
                    <Card withBorder radius='md' p='md'>
                        <Divider
                            label='Resolución Exclusiva de Administración'
                            labelPosition='center'
                            mb='sm'
                        />
                        <Stack gap='sm'>
                            <TextInput
                                label='Nota de resolución'
                                placeholder='Conclusión oficial del caso...'
                                value={resolutionNote}
                                onChange={e => setResolutionNote(e.currentTarget.value)}
                            />
                            <Group justify='flex-end' gap='sm'>
                                <Button
                                    color='red'
                                    loading={resolving}
                                    leftSection={<IconBan size={16} />}
                                    onClick={() => handleVerdict('Baneado')}>
                                    Baneado
                                </Button>
                                <Button
                                    color='teal'
                                    loading={resolving}
                                    leftSection={<IconShieldCheck size={16} />}
                                    onClick={() => handleVerdict('Indultado')}>
                                    Indultado
                                </Button>
                                <Button
                                    color='gray'
                                    variant='outline'
                                    loading={resolving}
                                    leftSection={<IconCheck size={16} />}
                                    onClick={() => handleVerdict('No Procede')}>
                                    No Procede
                                </Button>
                            </Group>
                        </Stack>
                    </Card>
                )}
            </Stack>
        </Container>
    );
};

export default BanCaseForumPageClient;
