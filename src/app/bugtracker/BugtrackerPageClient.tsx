'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    Badge,
    Button,
    Card,
    Container,
    Grid,
    Group,
    Loader,
    Modal,
    Select,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import {
    IconBug,
    IconCalendar,
    IconExternalLink,
    IconPhoto,
    IconRefresh,
    IconSearch,
    IconUser,
    IconUserCheck,
    IconVideo,
} from '@tabler/icons-react';
import { ILocalSessionData } from '@/domain/auth/auth-gateway';
import {
    assignBugServerAction,
    BugStatus,
    getBugsListAction,
    IBugDTO,
    IDeveloperUserDTO,
    updateBugStatusServerAction,
} from '@/infrastructure/adapters/bugs/bugs-actions';
import { NotificationsService } from '@/presentation/services/notification-service';
import { BugReportModal } from '@/presentation/components/bugs/BugReportModal';
import { I18nTypes } from '@/i18n/dictionaries';

interface BugtrackerPageClientProps {
    sessionUser: ILocalSessionData['user'];
    i18n?: I18nTypes['bugtracker'];
}

const STATUS_COLORS: Record<BugStatus, string> = {
    open: 'red',
    in_progress: 'yellow',
    resolved: 'teal',
    closed: 'gray',
};

const BugtrackerPageClient: React.FC<BugtrackerPageClientProps> = ({ sessionUser, i18n }) => {
    const isAdmin = Boolean(sessionUser?.isAdmin);

    const [bugs, setBugs] = useState<IBugDTO[]>([]);
    const [developers, setDevelopers] = useState<IDeveloperUserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedBug, setSelectedBug] = useState<IBugDTO | null>(null);
    const [updatingBugId, setUpdatingBugId] = useState<string | null>(null);
    const [createModalOpened, setCreateModalOpened] = useState(false);

    const getStatusLabel = useCallback(
        (status: BugStatus) => {
            return i18n?.statuses?.[status] || status;
        },
        [i18n],
    );

    const fetchBugs = useCallback(async () => {
        setLoading(true);
        const res = await getBugsListAction({
            status: statusFilter === 'all' ? undefined : statusFilter,
            search: searchQuery.trim() || undefined,
        });

        if (res.success && res.data) {
            setBugs(res.data.bugs || []);
            if (res.data.developers) {
                setDevelopers(res.data.developers);
            }
        } else {
            NotificationsService.error({
                title: i18n?.notifications?.loadErrorTitle || 'Error',
                message:
                    i18n?.notifications?.loadErrorMessage ||
                    'No se pudieron cargar los tickets de bugs.',
            });
        }
        setLoading(false);
    }, [statusFilter, searchQuery, i18n]);

    useEffect(() => {
        fetchBugs();
    }, [fetchBugs]);

    const handleStatusChange = async (bugId: string, newStatus: BugStatus) => {
        setUpdatingBugId(bugId);
        const res = await updateBugStatusServerAction(bugId, newStatus);
        setUpdatingBugId(null);

        if (res.success && res.data?.bug) {
            const updated = res.data.bug;
            setBugs(prev => prev.map(b => (b._id === bugId ? updated : b)));
            if (selectedBug?._id === bugId) {
                setSelectedBug(updated);
            }
            const statusLabel = getStatusLabel(newStatus);
            NotificationsService.success({
                title: i18n?.notifications?.statusSuccessTitle || 'Estado actualizado',
                message:
                    i18n?.notifications?.statusSuccessMessage?.replace('{status}', statusLabel) ||
                    `El ticket ahora está en estado "${statusLabel}".`,
            });
        } else {
            NotificationsService.error({
                title: i18n?.notifications?.statusErrorTitle || 'Error',
                message:
                    i18n?.notifications?.statusErrorMessage ||
                    'No se pudo actualizar el estado del ticket.',
            });
        }
    };

    const handleAssignChange = async (bugId: string, developerId: string | null) => {
        setUpdatingBugId(bugId);
        const res = await assignBugServerAction(bugId, developerId);
        setUpdatingBugId(null);

        if (res.success && res.data?.bug) {
            const updated = res.data.bug;
            setBugs(prev => prev.map(b => (b._id === bugId ? updated : b)));
            if (selectedBug?._id === bugId) {
                setSelectedBug(updated);
            }
            NotificationsService.success({
                title: i18n?.notifications?.assignSuccessTitle || 'Bug reasignado',
                message:
                    i18n?.notifications?.assignSuccessMessage ||
                    (updated.assignedToUsername
                        ? `Bug asignado a @${updated.assignedToUsername} (OpenFGA actualizado).`
                        : 'El bug ha quedado sin asignar.'),
            });
        } else {
            NotificationsService.error({
                title: i18n?.notifications?.assignErrorTitle || 'Error',
                message:
                    i18n?.notifications?.assignErrorMessage ||
                    'No se pudo reasignar el ticket.',
            });
        }
    };

    const unassignedLabel = i18n?.card?.unassigned || 'Sin asignar';

    const developerOptions = [
        { value: '__unassigned__', label: unassignedLabel },
        ...developers.map(dev => ({
            value: dev.id,
            label: `@${dev.username}${dev.name ? ` (${dev.name})` : ''}`,
        })),
    ];

    const statusOptions = [
        { value: 'open', label: i18n?.statuses?.open || 'Abierto' },
        { value: 'in_progress', label: i18n?.statuses?.in_progress || 'En Progreso' },
        { value: 'resolved', label: i18n?.statuses?.resolved || 'Resuelto' },
        { value: 'closed', label: i18n?.statuses?.closed || 'Cerrado' },
    ];

    const stats = {
        total: bugs.length,
        open: bugs.filter(b => b.status === 'open').length,
        inProgress: bugs.filter(b => b.status === 'in_progress').length,
        resolved: bugs.filter(b => b.status === 'resolved' || b.status === 'closed').length,
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
                            'linear-gradient(135deg, rgba(239, 68, 68, 0.14) 0%, rgba(15, 23, 42, 0.85) 100%)',
                        border: '1px solid rgba(239, 68, 68, 0.28)',
                    }}>
                    <Group justify='space-between' align='center' wrap='wrap'>
                        <Group gap='md'>
                            <div
                                style={{
                                    width: 52,
                                    height: 52,
                                    borderRadius: 14,
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                <IconBug size={30} color='#ef4444' />
                            </div>
                            <div>
                                <Group gap='xs'>
                                    <Title order={2}>
                                        {i18n?.header?.title || 'Bugtracker'}
                                    </Title>
                                    <Badge
                                        color={isAdmin ? 'red' : 'violet'}
                                        variant='filled'
                                        size='sm'>
                                        {isAdmin ? 'Admin' : 'Developer'}
                                    </Badge>
                                </Group>
                                <Text size='sm' c='dimmed'>
                                    {i18n?.header?.description ||
                                        (isAdmin
                                            ? 'Supervisa todos los reportes, estado de resolución y reasigna tickets a los desarrolladores.'
                                            : 'Visualiza y gestiona los tickets de bugs asignados a tu cuenta mediante OpenFGA.')}
                                </Text>
                            </div>
                        </Group>

                        <Group gap='sm'>
                            <Button
                                variant='light'
                                color='gray'
                                leftSection={<IconRefresh size={16} />}
                                onClick={fetchBugs}
                                loading={loading}>
                                {i18n?.header?.refreshBtn || 'Actualizar'}
                            </Button>
                            <Button
                                color='red'
                                leftSection={<IconBug size={16} />}
                                onClick={() => setCreateModalOpened(true)}>
                                {i18n?.header?.reportBugBtn || 'Reportar Bug'}
                            </Button>
                        </Group>
                    </Group>

                    <SimpleGrid cols={{ base: 2, sm: 4 }} mt='lg'>
                        <Card radius='md' p='sm' withBorder>
                            <Text size='xs' c='dimmed'>
                                {i18n?.stats?.total || 'Total'}
                            </Text>
                            <Text fw={800} size='xl'>
                                {stats.total}
                            </Text>
                        </Card>
                        <Card radius='md' p='sm' withBorder>
                            <Text size='xs' c='red'>
                                {i18n?.stats?.open || 'Abiertos'}
                            </Text>
                            <Text fw={800} size='xl' c='red'>
                                {stats.open}
                            </Text>
                        </Card>
                        <Card radius='md' p='sm' withBorder>
                            <Text size='xs' c='yellow'>
                                {i18n?.stats?.inProgress || 'En Progreso'}
                            </Text>
                            <Text fw={800} size='xl' c='yellow'>
                                {stats.inProgress}
                            </Text>
                        </Card>
                        <Card radius='md' p='sm' withBorder>
                            <Text size='xs' c='teal'>
                                {i18n?.stats?.resolved || 'Resueltos'}
                            </Text>
                            <Text fw={800} size='xl' c='teal'>
                                {stats.resolved}
                            </Text>
                        </Card>
                    </SimpleGrid>
                </Card>

                {/* Filters */}
                <Card radius='md' p='md' withBorder>
                    <Group justify='space-between' wrap='wrap' gap='md'>
                        <TextInput
                            placeholder={
                                i18n?.filters?.searchPlaceholder ||
                                'Buscar por título, contenido o usuario...'
                            }
                            leftSection={<IconSearch size={16} />}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.currentTarget.value)}
                            style={{ flex: 1, minWidth: 260 }}
                        />
                        <SegmentedControl
                            value={statusFilter}
                            onChange={setStatusFilter}
                            data={[
                                { label: i18n?.filters?.statusAll || 'Todos', value: 'all' },
                                { label: i18n?.filters?.statusOpen || 'Abiertos', value: 'open' },
                                {
                                    label: i18n?.filters?.statusInProgress || 'En Progreso',
                                    value: 'in_progress',
                                },
                                {
                                    label: i18n?.filters?.statusResolved || 'Resueltos',
                                    value: 'resolved',
                                },
                                {
                                    label: i18n?.filters?.statusClosed || 'Cerrados',
                                    value: 'closed',
                                },
                            ]}
                        />
                    </Group>
                </Card>

                {/* Bug List */}
                {loading ? (
                    <Stack align='center' py='xl'>
                        <Loader color='red' />
                        <Text size='sm' c='dimmed'>
                            {i18n?.loading || 'Cargando tickets de bugs...'}
                        </Text>
                    </Stack>
                ) : bugs.length === 0 ? (
                    <Card radius='md' p='xl' withBorder ta='center'>
                        <Stack align='center' gap='xs'>
                            <IconBug size={40} color='gray' />
                            <Title order={4}>
                                {i18n?.empty?.title || 'No se encontraron reportes de bugs'}
                            </Title>
                            <Text size='sm' c='dimmed'>
                                {i18n?.empty?.description ||
                                    'No hay tickets que coincidan con los filtros seleccionados o aún no se han reportado errores.'}
                            </Text>
                        </Stack>
                    </Card>
                ) : (
                    <Grid>
                        {bugs.map(bug => (
                            <Grid.Col key={bug._id} span={{ base: 12, md: 6 }}>
                                <Card
                                    radius='md'
                                    p='lg'
                                    withBorder
                                    style={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                    }}>
                                    <Stack gap='sm'>
                                        <Group justify='space-between' align='flex-start'>
                                            <Badge
                                                color={STATUS_COLORS[bug.status] || 'gray'}
                                                variant='filled'>
                                                {getStatusLabel(bug.status)}
                                            </Badge>
                                            <Group gap={6}>
                                                <IconCalendar size={14} />
                                                <Text size='xs' c='dimmed'>
                                                    {new Date(bug.createdAt).toLocaleString()}
                                                </Text>
                                            </Group>
                                        </Group>

                                        <Title
                                            order={4}
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => setSelectedBug(bug)}>
                                            {bug.title}
                                        </Title>

                                        <Text size='sm' c='dimmed' lineClamp={3}>
                                            {bug.description}
                                        </Text>

                                        <Group gap='md' mt='xs'>
                                            <Badge
                                                variant='light'
                                                color='grape'
                                                leftSection={<IconUser size={12} />}>
                                                {i18n?.card?.reportedBy || 'Reportado por:'} @
                                                {bug.reportedBy?.username || 'usuario'}
                                            </Badge>

                                            <Badge
                                                variant='light'
                                                color={bug.assignedTo ? 'blue' : 'gray'}
                                                leftSection={<IconUserCheck size={12} />}>
                                                {bug.assignedToUsername
                                                    ? `${i18n?.card?.assignedTo || 'Asignado a:'} @${bug.assignedToUsername}`
                                                    : unassignedLabel}
                                            </Badge>

                                            {Array.isArray(bug.media) && bug.media.length > 0 && (
                                                <Badge
                                                    variant='outline'
                                                    color='red'
                                                    leftSection={<IconPhoto size={12} />}>
                                                    {bug.media.length}{' '}
                                                    {i18n?.card?.attachments || 'Adjuntos'}
                                                </Badge>
                                            )}
                                        </Group>
                                    </Stack>

                                    <Group
                                        justify='space-between'
                                        mt='lg'
                                        pt='sm'
                                        style={{
                                            borderTop: '1px solid rgba(148, 163, 184, 0.2)',
                                        }}>
                                        <Select
                                            size='xs'
                                            label={i18n?.detailModal?.status || 'Estado'}
                                            value={bug.status}
                                            disabled={updatingBugId === bug._id}
                                            onChange={val => {
                                                if (val) {
                                                    handleStatusChange(bug._id, val as BugStatus);
                                                }
                                            }}
                                            data={statusOptions}
                                            style={{ width: 155 }}
                                        />

                                        {isAdmin && (
                                            <Select
                                                size='xs'
                                                label={i18n?.card?.reassignLabel || 'Asignar developer:'}
                                                value={bug.assignedTo ?? '__unassigned__'}
                                                disabled={updatingBugId === bug._id}
                                                onChange={val => {
                                                    const devId =
                                                        !val || val === '__unassigned__'
                                                            ? null
                                                            : val;
                                                    handleAssignChange(bug._id, devId);
                                                }}
                                                data={developerOptions}
                                                style={{ width: 190 }}
                                            />
                                        )}

                                        <Button
                                            size='xs'
                                            variant='light'
                                            color='red'
                                            mt={18}
                                            onClick={() => setSelectedBug(bug)}>
                                            {i18n?.card?.viewDetailsBtn || 'Ver detalles'}
                                        </Button>
                                    </Group>
                                </Card>
                            </Grid.Col>
                        ))}
                    </Grid>
                )}
            </Stack>

            {/* Detail Modal */}
            <Modal
                opened={!!selectedBug}
                onClose={() => setSelectedBug(null)}
                size='lg'
                radius='md'
                centered
                title={
                    <Group gap='xs'>
                        <IconBug size={20} color='#ef4444' />
                        <Text fw={700}>
                            {i18n?.detailModal?.title || 'Detalle del Reporte de Bug'}
                        </Text>
                    </Group>
                }>
                {selectedBug && (
                    <Stack gap='md'>
                        <Group justify='space-between'>
                            <Badge
                                size='lg'
                                color={STATUS_COLORS[selectedBug.status] || 'gray'}
                                variant='filled'>
                                {getStatusLabel(selectedBug.status)}
                            </Badge>
                            <Text size='xs' c='dimmed'>
                                ID: {selectedBug._id}
                            </Text>
                        </Group>

                        <Title order={3}>{selectedBug.title}</Title>

                        <Card withBorder radius='md' p='md'>
                            <Text size='sm' style={{ whiteSpace: 'pre-wrap' }}>
                                {selectedBug.description}
                            </Text>
                        </Card>

                        <Group gap='md'>
                            <Text size='sm'>
                                <strong>{i18n?.card?.reportedBy || 'Reportado por:'}</strong> @
                                {selectedBug.reportedBy?.username}
                            </Text>
                            <Text size='sm'>
                                <strong>{i18n?.card?.assignedTo || 'Asignado a:'}</strong>{' '}
                                {selectedBug.assignedToUsername
                                    ? `@${selectedBug.assignedToUsername}`
                                    : unassignedLabel}
                            </Text>
                        </Group>

                        {Array.isArray(selectedBug.media) && selectedBug.media.length > 0 && (
                            <Stack gap='xs'>
                                <Text fw={600} size='sm'>
                                    {i18n?.detailModal?.evidence ||
                                        'Evidencia adjunta (Imágenes / Videos)'}{' '}
                                    ({selectedBug.media.length})
                                </Text>
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing='sm'>
                                    {selectedBug.media.map((m, idx) => (
                                        <Card
                                            key={`${m.key}-${idx}`}
                                            withBorder
                                            radius='md'
                                            p='xs'>
                                            <Stack gap='xs'>
                                                {m.type?.startsWith('video/') ? (
                                                    m.url ? (
                                                        <video
                                                            src={m.url}
                                                            controls
                                                            style={{
                                                                width: '100%',
                                                                maxHeight: 220,
                                                                borderRadius: 8,
                                                            }}
                                                        />
                                                    ) : (
                                                        <Group gap='xs'>
                                                            <IconVideo size={18} />
                                                            <Text size='xs'>{m.name}</Text>
                                                        </Group>
                                                    )
                                                ) : m.url ? (
                                                    /* eslint-disable-next-line @next/next/no-img-element */
                                                    <img
                                                        src={m.url}
                                                        alt={m.name}
                                                        style={{
                                                            width: '100%',
                                                            maxHeight: 220,
                                                            objectFit: 'cover',
                                                            borderRadius: 8,
                                                        }}
                                                    />
                                                ) : (
                                                    <Group gap='xs'>
                                                        <IconPhoto size={18} />
                                                        <Text size='xs'>{m.name}</Text>
                                                    </Group>
                                                )}

                                                <Group justify='space-between'>
                                                    <Text
                                                        size='xs'
                                                        truncate
                                                        style={{ maxWidth: 160 }}>
                                                        {m.name}
                                                    </Text>
                                                    {m.url && (
                                                        <Button
                                                            component='a'
                                                            href={m.url}
                                                            target='_blank'
                                                            rel='noreferrer'
                                                            size='compact-xs'
                                                            variant='subtle'
                                                            rightSection={
                                                                <IconExternalLink size={12} />
                                                            }>
                                                            {i18n?.detailModal?.viewEvidence ||
                                                                'Ver archivo'}
                                                        </Button>
                                                    )}
                                                </Group>
                                            </Stack>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            </Stack>
                        )}

                        <Group justify='space-between' mt='md'>
                            <Select
                                label={i18n?.detailModal?.changeStatus || 'Cambiar Estado'}
                                value={selectedBug.status}
                                onChange={val => {
                                    if (val) {
                                        handleStatusChange(selectedBug._id, val as BugStatus);
                                    }
                                }}
                                data={statusOptions}
                            />

                            {isAdmin && (
                                <Select
                                    label={
                                        i18n?.detailModal?.reassignDeveloper ||
                                        'Reasignar a Developer'
                                    }
                                    value={selectedBug.assignedTo ?? '__unassigned__'}
                                    onChange={val => {
                                        const devId =
                                            !val || val === '__unassigned__' ? null : val;
                                        handleAssignChange(selectedBug._id, devId);
                                    }}
                                    data={developerOptions}
                                />
                            )}
                        </Group>
                    </Stack>
                )}
            </Modal>

            <BugReportModal
                opened={createModalOpened}
                onClose={() => {
                    setCreateModalOpened(false);
                    fetchBugs();
                }}
            />
        </Container>
    );
};

export default BugtrackerPageClient;
