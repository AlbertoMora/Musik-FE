'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActionIcon,
    Avatar,
    Badge,
    Button,
    Card,
    Container,
    Divider,
    Group,
    Loader,
    Modal,
    Paper,
    ScrollArea,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Switch,
    Table,
    Tabs,
    Text,
    Textarea,
    TextInput,
    Title,
} from '@mantine/core';
import {
    IconAlertTriangle,
    IconBan,
    IconCheck,
    IconExternalLink,
    IconFileUpload,
    IconGavel,
    IconMessage2,
    IconPhoto,
    IconRefresh,
    IconSearch,
    IconSend,
    IconShieldCheck,
    IconShieldLock,
    IconTrash,
    IconUsers,
    IconVideo,
} from '@tabler/icons-react';
import { ILocalSessionData } from '@/domain/auth/auth-gateway';
import {
    createBanCaseServerAction,
    getAdminUsersServerAction,
    getBanCaseDetailServerAction,
    getBanCasePresignedUploadServerAction,
    getBanCasesServerAction,
    IAdminUserDTO,
    IBanCaseDTO,
    IBanForumMessageDTO,
    postBanCaseMessageServerAction,
    resolveBanCaseServerAction,
    updateUserRolesServerAction,
} from '@/infrastructure/adapters/admin/admin-actions';
import { IBugMediaDTO } from '@/infrastructure/adapters/bugs/bugs-actions';
import { controlledFileUploadRequest } from '@/utils/web-utils';
import { NotificationsService } from '@/presentation/services/notification-service';

interface AdminUsersPageClientProps {
    sessionUser: ILocalSessionData['user'];
}

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

const VERDICT_BADGE_COLORS: Record<string, string> = {
    open: 'yellow',
    Baneado: 'red',
    Indultado: 'teal',
    'No Procede': 'gray',
};

const AdminUsersPageClient: React.FC<AdminUsersPageClientProps> = ({ sessionUser }) => {
    const [activeTab, setActiveTab] = useState<string | null>('users');

    // Users state
    const [users, setUsers] = useState<IAdminUserDTO[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    // Ban Forum Cases state
    const [banCases, setBanCases] = useState<IBanCaseDTO[]>([]);
    const [loadingCases, setLoadingCases] = useState(false);

    // Create New Ban Report Modal State
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [reportedTargetUser, setReportedTargetUser] = useState<IAdminUserDTO | null>(null);
    const [reportTitle, setReportTitle] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportFiles, setReportFiles] = useState<File[]>([]);
    const [submittingReport, setSubmittingReport] = useState(false);
    const reportFileInputRef = useRef<HTMLInputElement | null>(null);

    // Forum Thread Modal State
    const [activeForumCase, setActiveForumCase] = useState<IBanCaseDTO | null>(null);
    const [forumMessages, setForumMessages] = useState<IBanForumMessageDTO[]>([]);
    const [loadingForumDetail, setLoadingForumDetail] = useState(false);
    const [newForumReply, setNewForumReply] = useState('');
    const [replyFiles, setReplyFiles] = useState<File[]>([]);
    const [sendingReply, setSendingReply] = useState(false);
    const [resolutionNote, setResolutionNote] = useState('');
    const [resolvingVerdict, setResolvingVerdict] = useState(false);
    const replyFileInputRef = useRef<HTMLInputElement | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoadingUsers(true);
        const res = await getAdminUsersServerAction({
            search: searchQuery.trim() || undefined,
            role: roleFilter,
        });
        if (res.success && res.data?.users) {
            setUsers(res.data.users);
        } else {
            NotificationsService.error({
                title: 'Error',
                message: 'No se pudo cargar la lista de usuarios.',
            });
        }
        setLoadingUsers(false);
    }, [searchQuery, roleFilter]);

    const fetchBanCases = useCallback(async () => {
        setLoadingCases(true);
        const res = await getBanCasesServerAction();
        if (res.success && res.data?.banCases) {
            setBanCases(res.data.banCases);
        }
        setLoadingCases(false);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        fetchBanCases();
    }, [fetchBanCases]);

    const handleToggleRole = async (
        user: IAdminUserDTO,
        field: 'isAdmin' | 'isDeveloper',
        value: boolean,
    ) => {
        setUpdatingUserId(user.id);
        const res = await updateUserRolesServerAction(user.id, { [field]: value });
        setUpdatingUserId(null);

        if (res.success && res.data?.user) {
            const updated = res.data.user;
            setUsers(prev => prev.map(u => (u.id === user.id ? updated : u)));
            NotificationsService.success({
                title: 'Permisos actualizados',
                message: `Se actualizó ${field} para @${user.username}.`,
            });
        } else {
            NotificationsService.error({
                title: 'Error',
                message: 'No se pudo actualizar el rol del usuario.',
            });
        }
    };

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

    const openReportModalForUser = (user: IAdminUserDTO) => {
        setReportedTargetUser(user);
        setReportTitle('');
        setReportDescription('');
        setReportFiles([]);
        setReportModalOpen(true);
    };

    const handleCreateBanCase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reportedTargetUser || !reportTitle.trim() || !reportDescription.trim()) {
            NotificationsService.error({
                title: 'Campos requeridos',
                message: 'Por favor ingresa un título y una descripción para abrir el ticket en el foro.',
            });
            return;
        }

        const totalSize = reportFiles.reduce((acc, f) => acc + f.size, 0);
        if (totalSize > MAX_BYTES) {
            NotificationsService.error({
                title: 'Límite excedido',
                message: 'Los archivos adjuntos no pueden superar los 50 MB.',
            });
            return;
        }

        setSubmittingReport(true);
        try {
            const media = await uploadFilesToS3(reportFiles);
            const res = await createBanCaseServerAction({
                reportedUserId: reportedTargetUser.id,
                title: reportTitle.trim(),
                description: reportDescription.trim(),
                media,
            });

            if (!res.success || !res.data?.banCase) {
                throw new Error('Failed to create ban case');
            }

            NotificationsService.success({
                title: 'Ticket de Foro creado',
                message: `Se ha abierto el caso contra @${reportedTargetUser.username}.`,
            });
            setReportModalOpen(false);
            await fetchBanCases();
            setActiveTab('forum');
            openForumCaseDetail(res.data.banCase.id);
        } catch (err) {
            console.error(err);
            NotificationsService.error({
                title: 'Error',
                message: 'No se pudo abrir el ticket en el foro de moderación.',
            });
        } finally {
            setSubmittingReport(false);
        }
    };

    const openForumCaseDetail = async (caseId: string) => {
        setLoadingForumDetail(true);
        setResolutionNote('');
        setNewForumReply('');
        setReplyFiles([]);

        const res = await getBanCaseDetailServerAction(caseId);
        setLoadingForumDetail(false);

        if (res.success && res.data) {
            setActiveForumCase(res.data.banCase);
            setForumMessages(res.data.messages || []);
        } else {
            NotificationsService.error({
                title: 'Acceso denegado o error',
                message: 'No se pudo cargar el hilo del foro.',
            });
        }
    };

    const handleSendForumReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeForumCase) return;
        if (!newForumReply.trim() && replyFiles.length === 0) return;

        setSendingReply(true);
        try {
            const media = await uploadFilesToS3(replyFiles);
            const res = await postBanCaseMessageServerAction(activeForumCase.id, {
                message: newForumReply.trim() || 'Evidencia adjunta',
                media,
            });

            if (res.success && res.data?.message) {
                setForumMessages(prev => [...prev, res.data!.message]);
                setNewForumReply('');
                setReplyFiles([]);
                NotificationsService.success({
                    title: 'Mensaje publicado',
                    message: 'Tu respuesta/evidencia se agregó al hilo del caso.',
                });
            }
        } catch (err) {
            console.error(err);
            NotificationsService.error({
                title: 'Error',
                message: 'No se pudo publicar la respuesta en el foro.',
            });
        } finally {
            setSendingReply(false);
        }
    };

    const handleResolveVerdict = async (verdict: 'Baneado' | 'Indultado' | 'No Procede') => {
        if (!activeForumCase) return;
        setResolvingVerdict(true);

        const res = await resolveBanCaseServerAction(activeForumCase.id, {
            verdict,
            resolutionNote: resolutionNote.trim() || undefined,
        });

        setResolvingVerdict(false);

        if (res.success && res.data?.banCase) {
            NotificationsService.success({
                title: `Caso cerrado: ${verdict}`,
                message: `El ticket ha sido cerrado con la decisión "${verdict}".`,
            });
            await openForumCaseDetail(activeForumCase.id);
            await fetchBanCases();
            await fetchUsers();
        } else {
            NotificationsService.error({
                title: 'Error',
                message: 'No se pudo emitir la resolución del caso.',
            });
        }
    };

    return (
        <Container size='xl' py='xl'>
            <Stack gap='lg'>
                {/* Header */}
                <Card
                    radius='lg'
                    p='xl'
                    style={{
                        background:
                            'linear-gradient(135deg, rgba(139, 92, 246, 0.16) 0%, rgba(15, 23, 42, 0.9) 100%)',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                    }}>
                    <Group justify='space-between' align='center' wrap='wrap'>
                        <Group gap='md'>
                            <div
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 14,
                                    background: 'rgba(139, 92, 246, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                <IconShieldLock size={30} color='#a78bfa' />
                            </div>
                            <div>
                                <Group gap='xs'>
                                    <Title order={2}>Panel de Administración</Title>
                                    <Badge color='grape' variant='filled'>
                                        Admin: @{sessionUser.username}
                                    </Badge>
                                </Group>
                                <Text size='sm' c='dimmed'>
                                    Administra permisos de usuarios (isAdmin / isDeveloper) y modera los casos de baneo mediante el Foro de Evidencias.
                                </Text>
                            </div>
                        </Group>

                        <Group gap='sm'>
                            <Button
                                component='a'
                                href='/bugtracker'
                                variant='light'
                                color='red'>
                                Ir a Bugtracker
                            </Button>
                            <Button
                                variant='light'
                                color='gray'
                                leftSection={<IconRefresh size={16} />}
                                onClick={() => {
                                    fetchUsers();
                                    fetchBanCases();
                                }}>
                                Actualizar Todo
                            </Button>
                        </Group>
                    </Group>
                </Card>

                <Tabs value={activeTab} onChange={setActiveTab} variant='pills' radius='md'>
                    <Tabs.List>
                        <Tabs.Tab value='users' leftSection={<IconUsers size={16} />}>
                            Directorio de Usuarios ({users.length})
                        </Tabs.Tab>
                        <Tabs.Tab value='forum' leftSection={<IconGavel size={16} />}>
                            Foro de Moderación y Baneos ({banCases.length})
                        </Tabs.Tab>
                    </Tabs.List>

                    {/* TAB 1: USERS */}
                    <Tabs.Panel value='users' pt='md'>
                        <Stack gap='md'>
                            <Card withBorder radius='md' p='md'>
                                <Group justify='space-between' wrap='wrap' gap='md'>
                                    <TextInput
                                        placeholder='Filtrar por usuario, correo o nombre...'
                                        leftSection={<IconSearch size={16} />}
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.currentTarget.value)}
                                        style={{ flex: 1, minWidth: 260 }}
                                    />
                                    <SegmentedControl
                                        value={roleFilter}
                                        onChange={setRoleFilter}
                                        data={[
                                            { label: 'Todos', value: 'all' },
                                            { label: 'Admins', value: 'admin' },
                                            { label: 'Developers', value: 'developer' },
                                            { label: 'Baneados', value: 'banned' },
                                        ]}
                                    />
                                </Group>
                            </Card>

                            <Card withBorder radius='md' p={0}>
                                {loadingUsers ? (
                                    <Stack align='center' py='xl'>
                                        <Loader color='grape' />
                                        <Text size='sm' c='dimmed'>
                                            Cargando usuarios...
                                        </Text>
                                    </Stack>
                                ) : (
                                    <ScrollArea>
                                        <Table highlightOnHover verticalSpacing='sm' horizontalSpacing='md'>
                                            <Table.Thead>
                                                <Table.Tr>
                                                    <Table.Th>Usuario</Table.Th>
                                                    <Table.Th>Correo</Table.Th>
                                                    <Table.Th>Estado</Table.Th>
                                                    <Table.Th>Admin (isAdmin)</Table.Th>
                                                    <Table.Th>Developer (isDeveloper)</Table.Th>
                                                    <Table.Th>Moderación (Foro)</Table.Th>
                                                </Table.Tr>
                                            </Table.Thead>
                                            <Table.Tbody>
                                                {users.map(u => {
                                                    const userCases = banCases.filter(
                                                        c => c.banned_player_id === u.id,
                                                    );
                                                    const latestCase = userCases[0];

                                                    return (
                                                        <Table.Tr key={u.id}>
                                                            <Table.Td>
                                                                <Group gap='sm'>
                                                                    <Avatar
                                                                        src={u.prof_pic}
                                                                        color='grape'
                                                                        radius='xl'
                                                                        size='sm'>
                                                                        {u.username
                                                                            ?.charAt(0)
                                                                            .toUpperCase()}
                                                                    </Avatar>
                                                                    <div>
                                                                        <Text size='sm' fw={600}>
                                                                            @{u.username}
                                                                        </Text>
                                                                        <Text size='xs' c='dimmed'>
                                                                            {[u.name, u.lastname]
                                                                                .filter(Boolean)
                                                                                .join(' ') || 'Sin nombre'}
                                                                        </Text>
                                                                    </div>
                                                                </Group>
                                                            </Table.Td>
                                                            <Table.Td>
                                                                <Text size='sm'>{u.email}</Text>
                                                            </Table.Td>
                                                            <Table.Td>
                                                                {u.isactive ? (
                                                                    <Badge color='teal' variant='light'>
                                                                        Activo
                                                                    </Badge>
                                                                ) : (
                                                                    <Badge color='red' variant='filled'>
                                                                        Baneado
                                                                    </Badge>
                                                                )}
                                                            </Table.Td>
                                                            <Table.Td>
                                                                <Switch
                                                                    checked={u.isAdmin}
                                                                    disabled={updatingUserId === u.id}
                                                                    color='grape'
                                                                    onChange={e =>
                                                                        handleToggleRole(
                                                                            u,
                                                                            'isAdmin',
                                                                            e.currentTarget.checked,
                                                                        )
                                                                    }
                                                                    label={u.isAdmin ? 'Sí' : 'No'}
                                                                />
                                                            </Table.Td>
                                                            <Table.Td>
                                                                <Switch
                                                                    checked={u.isDeveloper}
                                                                    disabled={updatingUserId === u.id}
                                                                    color='blue'
                                                                    onChange={e =>
                                                                        handleToggleRole(
                                                                            u,
                                                                            'isDeveloper',
                                                                            e.currentTarget.checked,
                                                                        )
                                                                    }
                                                                    label={u.isDeveloper ? 'Sí' : 'No'}
                                                                />
                                                            </Table.Td>
                                                            <Table.Td>
                                                                <Group gap='xs'>
                                                                    <Button
                                                                        size='compact-xs'
                                                                        color='red'
                                                                        variant='light'
                                                                        leftSection={<IconGavel size={13} />}
                                                                        onClick={() => openReportModalForUser(u)}>
                                                                        Abrir Caso / Reportar
                                                                    </Button>
                                                                    {latestCase && (
                                                                        <Button
                                                                            size='compact-xs'
                                                                            color='grape'
                                                                            variant='subtle'
                                                                            leftSection={<IconMessage2 size={13} />}
                                                                            onClick={() =>
                                                                                openForumCaseDetail(
                                                                                    latestCase.id,
                                                                                )
                                                                            }>
                                                                            Ver Foro ({userCases.length})
                                                                        </Button>
                                                                    )}
                                                                </Group>
                                                            </Table.Td>
                                                        </Table.Tr>
                                                    );
                                                })}
                                            </Table.Tbody>
                                        </Table>
                                    </ScrollArea>
                                )}
                            </Card>
                        </Stack>
                    </Tabs.Panel>

                    {/* TAB 2: BAN CASES FORUM */}
                    <Tabs.Panel value='forum' pt='md'>
                        <Stack gap='md'>
                            {loadingCases ? (
                                <Stack align='center' py='xl'>
                                    <Loader color='grape' />
                                    <Text size='sm' c='dimmed'>
                                        Cargando casos del foro de moderación...
                                    </Text>
                                </Stack>
                            ) : banCases.length === 0 ? (
                                <Card withBorder radius='md' p='xl' ta='center'>
                                    <Stack align='center' gap='xs'>
                                        <IconGavel size={40} color='gray' />
                                        <Title order={4}>No hay tickets abiertos en el foro</Title>
                                        <Text size='sm' c='dimmed'>
                                            Puedes abrir un ticket de reporte desde el Directorio de Usuarios adjuntando pruebas, título y descripción.
                                        </Text>
                                    </Stack>
                                </Card>
                            ) : (
                                <SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
                                    {banCases.map(c => (
                                        <Card key={c.id} withBorder radius='md' p='lg'>
                                            <Stack gap='sm'>
                                                <Group justify='space-between'>
                                                    <Badge
                                                        color={VERDICT_BADGE_COLORS[c.status] || 'blue'}
                                                        variant='filled'>
                                                        {c.status === 'open'
                                                            ? 'En Discusión (Abierto)'
                                                            : `Veredicto: ${c.status}`}
                                                    </Badge>
                                                    <Text size='xs' c='dimmed'>
                                                        {c.creation_date
                                                            ? new Date(c.creation_date).toLocaleString()
                                                            : ''}
                                                    </Text>
                                                </Group>

                                                <Title order={4}>
                                                    {c.title || 'Reporte de conducta de usuario'}
                                                </Title>

                                                <Text size='sm' c='dimmed' lineClamp={2}>
                                                    {c.player_report}
                                                </Text>

                                                <Group gap='sm'>
                                                    <Badge color='red' variant='light'>
                                                        Reportado: @{c.banned_player?.username || c.banned_player_id}
                                                    </Badge>
                                                    <Badge color='blue' variant='light'>
                                                        Reporta: @{c.reported_by_player?.username || c.reported_by_player_id}
                                                    </Badge>
                                                </Group>

                                                {c.resolution && (
                                                    <Paper p='xs' radius='sm' withBorder>
                                                        <Text size='xs' fw={600}>
                                                            Resolución final:
                                                        </Text>
                                                        <Text size='xs' c='dimmed'>
                                                            {c.resolution}
                                                        </Text>
                                                    </Paper>
                                                )}

                                                <Group justify='flex-end' mt='xs'>
                                                    <Button
                                                        size='xs'
                                                        color='grape'
                                                        leftSection={<IconMessage2 size={14} />}
                                                        onClick={() => openForumCaseDetail(c.id)}>
                                                        Entrar al Foro del Caso
                                                    </Button>
                                                </Group>
                                            </Stack>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            )}
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            </Stack>

            {/* MODAL 1: CREATE BAN REPORT TICKET */}
            <Modal
                opened={reportModalOpen}
                onClose={() => !submittingReport && setReportModalOpen(false)}
                centered
                size='lg'
                radius='md'
                title={
                    <Group gap='xs'>
                        <IconAlertTriangle size={20} color='#ef4444' />
                        <Text fw={700}>
                            Abrir Ticket en Foro contra @{reportedTargetUser?.username}
                        </Text>
                    </Group>
                }>
                <form onSubmit={handleCreateBanCase}>
                    <Stack gap='md'>
                        <Text size='xs' c='dimmed'>
                            Este ticket abrirá un expediente en el Foro Admin donde sólo podrán participar el usuario que reporta, el usuario reportado (@{reportedTargetUser?.username}) y los administradores para presentar pruebas y contraevidencia.
                        </Text>

                        <TextInput
                            label='Título del Reporte'
                            placeholder='Ej: Uso indebido de contenido o comportamiento abusivo'
                            value={reportTitle}
                            onChange={e => setReportTitle(e.currentTarget.value)}
                            required
                        />

                        <Textarea
                            label='Descripción detallada'
                            placeholder='Expón los hechos y motivos del reporte...'
                            minRows={4}
                            autosize
                            value={reportDescription}
                            onChange={e => setReportDescription(e.currentTarget.value)}
                            required
                        />

                        <div>
                            <Group justify='space-between' mb={6}>
                                <Text size='sm' fw={500}>
                                    Pruebas / Evidencia (Imágenes o Videos)
                                </Text>
                                <Button
                                    type='button'
                                    size='compact-xs'
                                    variant='light'
                                    leftSection={<IconFileUpload size={14} />}
                                    onClick={() => reportFileInputRef.current?.click()}>
                                    Adjuntar Pruebas
                                </Button>
                                <input
                                    ref={reportFileInputRef}
                                    type='file'
                                    multiple
                                    accept='image/*,video/*'
                                    style={{ display: 'none' }}
                                    onChange={e => {
                                        if (e.target.files) {
                                            setReportFiles(prev => [
                                                ...prev,
                                                ...Array.from(e.target.files!),
                                            ]);
                                        }
                                        e.target.value = '';
                                    }}
                                />
                            </Group>

                            {reportFiles.length > 0 && (
                                <Stack gap={6}>
                                    {reportFiles.map((f, i) => (
                                        <Group
                                            key={`${f.name}-${i}`}
                                            justify='space-between'
                                            p='xs'
                                            style={{
                                                border: '1px solid rgba(148,163,184,0.25)',
                                                borderRadius: 8,
                                            }}>
                                            <Text size='xs' truncate style={{ maxWidth: 320 }}>
                                                {f.name} ({(f.size / (1024 * 1024)).toFixed(2)} MB)
                                            </Text>
                                            <ActionIcon
                                                color='red'
                                                variant='subtle'
                                                onClick={() =>
                                                    setReportFiles(prev =>
                                                        prev.filter((_, idx) => idx !== i),
                                                    )
                                                }>
                                                <IconTrash size={14} />
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
                                onClick={() => setReportModalOpen(false)}
                                disabled={submittingReport}>
                                Cancelar
                            </Button>
                            <Button
                                type='submit'
                                color='red'
                                loading={submittingReport}
                                leftSection={<IconGavel size={16} />}>
                                Abrir Ticket en Foro
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* MODAL 2: FORUM THREAD & ADMIN VERDICT */}
            <Modal
                opened={!!activeForumCase}
                onClose={() => setActiveForumCase(null)}
                size='xl'
                radius='md'
                centered
                title={
                    <Group gap='xs'>
                        <IconGavel size={20} color='#a78bfa' />
                        <Text fw={700}>
                            Foro de Moderación: {activeForumCase?.title || 'Expediente de Usuario'}
                        </Text>
                    </Group>
                }>
                {loadingForumDetail ? (
                    <Stack align='center' py='xl'>
                        <Loader color='grape' />
                    </Stack>
                ) : (
                    activeForumCase && (
                        <Stack gap='md'>
                            <Paper withBorder p='md' radius='md'>
                                <Group justify='space-between' mb='xs'>
                                    <Group gap='sm'>
                                        <Badge color='red' variant='light'>
                                            Usuario Reportado: @
                                            {activeForumCase.banned_player?.username ||
                                                activeForumCase.banned_player_id}
                                        </Badge>
                                        <Badge color='blue' variant='light'>
                                            Reportado por: @
                                            {activeForumCase.reported_by_player?.username ||
                                                activeForumCase.reported_by_player_id}
                                        </Badge>
                                    </Group>
                                    <Badge
                                        size='lg'
                                        color={
                                            VERDICT_BADGE_COLORS[activeForumCase.status] || 'yellow'
                                        }
                                        variant='filled'>
                                        {activeForumCase.status === 'open'
                                            ? 'Abierto a Pruebas'
                                            : `Cerrado: ${activeForumCase.status}`}
                                    </Badge>
                                </Group>
                                <Text size='xs' c='dimmed'>
                                    Acceso exclusivo: Denunciante, Denunciado y Administradores.
                                </Text>
                            </Paper>

                            {/* Messages Thread */}
                            <ScrollArea h={340} offsetScrollbars>
                                <Stack gap='sm'>
                                    {forumMessages.map(msg => {
                                        const roleBadgeColor =
                                            msg.senderRole === 'admin'
                                                ? 'grape'
                                                : msg.senderRole === 'reported'
                                                  ? 'orange'
                                                  : 'blue';
                                        const roleLabel =
                                            msg.senderRole === 'admin'
                                                ? 'Admin'
                                                : msg.senderRole === 'reported'
                                                  ? 'Usuario Reportado (Defensa)'
                                                  : 'Reportante';

                                        return (
                                            <Card key={msg._id} withBorder radius='md' p='sm'>
                                                <Group justify='space-between' mb={6}>
                                                    <Group gap='xs'>
                                                        <Text fw={700} size='sm'>
                                                            @{msg.senderUsername}
                                                        </Text>
                                                        <Badge
                                                            size='xs'
                                                            color={roleBadgeColor}
                                                            variant='light'>
                                                            {roleLabel}
                                                        </Badge>
                                                    </Group>
                                                    <Text size='xs' c='dimmed'>
                                                        {new Date(msg.createdAt).toLocaleString()}
                                                    </Text>
                                                </Group>

                                                <Text size='sm' style={{ whiteSpace: 'pre-wrap' }}>
                                                    {msg.message}
                                                </Text>

                                                {Array.isArray(msg.media) &&
                                                    msg.media.length > 0 && (
                                                        <SimpleGrid
                                                            cols={{ base: 1, sm: 2 }}
                                                            mt='sm'
                                                            spacing='xs'>
                                                            {msg.media.map((m, i) => (
                                                                <Paper
                                                                    key={`${m.key}-${i}`}
                                                                    withBorder
                                                                    p='xs'
                                                                    radius='sm'>
                                                                    {m.type?.startsWith(
                                                                        'video/',
                                                                    ) ? (
                                                                        m.url ? (
                                                                            <video
                                                                                src={m.url}
                                                                                controls
                                                                                style={{
                                                                                    width: '100%',
                                                                                    maxHeight: 160,
                                                                                    borderRadius: 6,
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <Group gap='xs'>
                                                                                <IconVideo
                                                                                    size={16}
                                                                                />
                                                                                <Text size='xs'>
                                                                                    {m.name}
                                                                                </Text>
                                                                            </Group>
                                                                        )
                                                                    ) : m.url ? (
                                                                        <img
                                                                            src={m.url}
                                                                            alt={m.name}
                                                                            style={{
                                                                                width: '100%',
                                                                                maxHeight: 160,
                                                                                objectFit: 'cover',
                                                                                borderRadius: 6,
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <Group gap='xs'>
                                                                            <IconPhoto size={16} />
                                                                            <Text size='xs'>
                                                                                {m.name}
                                                                            </Text>
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
                                                                            rightSection={
                                                                                <IconExternalLink
                                                                                    size={12}
                                                                                />
                                                                            }>
                                                                            Ver Evidencia
                                                                        </Button>
                                                                    )}
                                                                </Paper>
                                                            ))}
                                                        </SimpleGrid>
                                                    )}
                                            </Card>
                                        );
                                    })}
                                </Stack>
                            </ScrollArea>

                            {/* Reply Form if case is open */}
                            {activeForumCase.status === 'open' && (
                                <form onSubmit={handleSendForumReply}>
                                    <Stack gap='xs'>
                                        <Textarea
                                            placeholder='Agrega pruebas adicionales, argumentos o contraevidencia al foro...'
                                            value={newForumReply}
                                            onChange={e => setNewForumReply(e.currentTarget.value)}
                                            minRows={2}
                                            autosize
                                        />
                                        <Group justify='space-between'>
                                            <Group gap='xs'>
                                                <Button
                                                    type='button'
                                                    size='xs'
                                                    variant='light'
                                                    leftSection={<IconFileUpload size={14} />}
                                                    onClick={() =>
                                                        replyFileInputRef.current?.click()
                                                    }>
                                                    Adjuntar Evidencia ({replyFiles.length})
                                                </Button>
                                                <input
                                                    ref={replyFileInputRef}
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
                                            </Group>
                                            <Button
                                                type='submit'
                                                size='xs'
                                                color='blue'
                                                loading={sendingReply}
                                                leftSection={<IconSend size={14} />}>
                                                Publicar en Foro
                                            </Button>
                                        </Group>
                                    </Stack>
                                </form>
                            )}

                            <Divider label='Decisión / Resolución de Administración' labelPosition='center' />

                            {/* Admin Verdict Resolution Controls */}
                            <Paper withBorder p='md' radius='md'>
                                <Stack gap='sm'>
                                    <TextInput
                                        label='Nota de resolución del administrador (opcional)'
                                        placeholder='Escribe la conclusión oficial para cerrar o actualizar el fallo del foro...'
                                        value={resolutionNote}
                                        onChange={e => setResolutionNote(e.currentTarget.value)}
                                    />
                                    <Group justify='space-between' wrap='wrap'>
                                        <Text size='xs' c='dimmed'>
                                            Selecciona la decisión final para cerrar el foro:
                                        </Text>
                                        <Group gap='sm'>
                                            <Button
                                                color='red'
                                                loading={resolvingVerdict}
                                                leftSection={<IconBan size={16} />}
                                                onClick={() => handleResolveVerdict('Baneado')}>
                                                Baneado
                                            </Button>
                                            <Button
                                                color='teal'
                                                loading={resolvingVerdict}
                                                leftSection={<IconShieldCheck size={16} />}
                                                onClick={() => handleResolveVerdict('Indultado')}>
                                                Indultado
                                            </Button>
                                            <Button
                                                color='gray'
                                                variant='outline'
                                                loading={resolvingVerdict}
                                                leftSection={<IconCheck size={16} />}
                                                onClick={() => handleResolveVerdict('No Procede')}>
                                                No Procede
                                            </Button>
                                        </Group>
                                    </Group>
                                </Stack>
                            </Paper>
                        </Stack>
                    )
                )}
            </Modal>
        </Container>
    );
};

export default AdminUsersPageClient;
