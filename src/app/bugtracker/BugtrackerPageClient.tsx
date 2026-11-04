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

interface BugtrackerPageClientProps {
    sessionUser: ILocalSessionData['user'];
}

const STATUS_LABELS: Record<BugStatus, string> = {
    open: 'Abierto',
    in_progress: 'En Progreso',
    resolved: 'Resuelto',
    closed: 'Cerrado',
};

const STATUS_COLORS: Record<BugStatus, string> = {
    open: 'red',
    in_progress: 'yellow',
    resolved: 'teal',
    closed: 'gray',
};

const BugtrackerPageClient: React.FC<BugtrackerPageClientProps> = ({ sessionUser }) => {
    const isAdmin = Boolean(sessionUser?.isAdmin);

    const [bugs, setBugs] = useState<IBugDTO[]>([]);
    const [developers, setDevelopers] = useState<IDeveloperUserDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedBug, setSelectedBug] = useState<IBugDTO | null>(null);
    const [updatingBugId, setUpdatingBugId] = useState<string | null>(null);
    const [createModalOpened, setCreateModalOpened] = useState(false);

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
                title: 'Error',
                message: 'No se pudieron cargar los tickets de bugs.',
            });
        }
        setLoading(false);
    }, [statusFilter, searchQuery]);

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
            NotificationsService.success({
                title: 'Estado actualizado',
                message: `El ticket ahora está en estado "${STATUS_LABELS[newStatus]}".`,
            });
        } else {
            NotificationsService.error({
                title: 'Error',
                message: 'No se pudo actualizar el estado del ticket.',
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
                title: 'Asignación actualizada',
                message: updated.assignedToUsername
                    ? `Bug asignado a @${updated.assignedToUsername} (OpenFGA actualizado).`
                    : 'El bug ha quedado sin asignar.',
            });
        } else {
            NotificationsService.error({
                title: 'Error',
                message: 'No se pudo reasignar el ticket.',
            });
        }
    };

    const developerOptions = [
        { value: '__unassigned__', label: 'Sin asignar' },
        ...developers.map(dev => ({
            value: dev.id,
            label: `@${dev.username}${dev.name ? ` (${dev.name})` : ''}`,
        })),
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
                                    <Title order={2}>Bugtracker</Title>
                                    <Badge
                                        color={isAdmin ? 'red' : 'violet'}
                                        variant='filled'
                                        size='sm'>
                                        {isAdmin ? 'Vista Admin (Total)' : 'Vista Developer (OpenFGA)'}
                                    </Badge>
                                </Group>
                                <Text size='sm' c='dimmed'>
                                    {isAdmin
                                        ? 'Supervisa todos los reportes, estado de resolución y reasigna tickets a los desarrolladores.'
                                        : 'Visualiza y gestiona los tickets de bugs asignados a tu cuenta mediante OpenFGA.'}
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
                                Actualizar
                            </Button>
                            <Button
                                color='red'
                                leftSection={<IconBug size={16} />}
                                onClick={() => setCreateModalOpened(true)}>
                                Nuevo Reporte
                            </Button>
                        </Group>
                    </Group>

                    <SimpleGrid cols={{ base: 2, sm: 4 }} mt='lg'>
                        <Card radius='md' p='sm' withBorder>
                            <Text size='xs' c='dimmed'>
                                Total Listados
                            </Text>
                            <Text fw={800} size='xl'>
                                {stats.total}
                            </Text>
                        </Card>
                        <Card radius='md' p='sm' withBorder>
                            <Text size='xs' c='red'>
                                Abiertos
                            </Text>
                            <Text fw={800} size='xl' c='red'>
                                {stats.open}
                            </Text>
                        </Card>
                        <Card radius='md' p='sm' withBorder>
                            <Text size='xs' c='yellow'>
                                En Progreso
                            </Text>
                            <Text fw={800} size='xl' c='yellow'>
                                {stats.inProgress}
                            </Text>
                        </Card>
                        <Card radius='md' p='sm' withBorder>
                            <Text size='xs' c='teal'>
                                Resueltos / Cerrados
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
                            placeholder='Buscar por título, descripción o autor...'
                            leftSection={<IconSearch size={16} />}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.currentTarget.value)}
                            style={{ flex: 1, minWidth: 260 }}
                        />
                        <SegmentedControl
                            value={statusFilter}
                            onChange={setStatusFilter}
                            data={[
                                { label: 'Todos', value: 'all' },
                                { label: 'Abiertos', value: 'open' },
                                { label: 'En Progreso', value: 'in_progress' },
                                { label: 'Resueltos', value: 'resolved' },
                                { label: 'Cerrados', value: 'closed' },
                            ]}
                        />
                    </Group>
                </Card>

                {/* Bug List */}
                {loading ? (
                    <Stack align='center' py='xl'>
                        <Loader color='red' />
                        <Text size='sm' c='dimmed'>
                            Cargando reportes de bugs...
                        </Text>
                    </Stack>
                ) : bugs.length === 0 ? (
                    <Card radius='md' p='xl' withBorder ta='center'>
                        <Stack align='center' gap='xs'>
                            <IconBug size={40} color='gray' />
                            <Title order={4}>No hay reportes de bugs para mostrar</Title>
                            <Text size='sm' c='dimmed'>
                                {isAdmin
                                    ? 'Aún no se han registrado reportes con los filtros actuales.'
                                    : 'No tienes tickets de bugs asignados actualmente con estos filtros.'}
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
                                                {STATUS_LABELS[bug.status] || bug.status}
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
                                                Reportado por: @{bug.reportedBy?.username || 'usuario'}
                                            </Badge>

                                            <Badge
                                                variant='light'
                                                color={bug.assignedTo ? 'blue' : 'gray'}
                                                leftSection={<IconUserCheck size={12} />}>
                                                {bug.assignedToUsername
                                                    ? `Asignado: @${bug.assignedToUsername}`
                                                    : 'Sin asignar'}
                                            </Badge>

                                            {Array.isArray(bug.media) && bug.media.length > 0 && (
                                                <Badge
                                                    variant='outline'
                                                    color='red'
                                                    leftSection={<IconPhoto size={12} />}>
                                                    {bug.media.length} adjunto(s)
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
                                            label='Estado del bug'
                                            value={bug.status}
                                            disabled={updatingBugId === bug._id}
                                            onChange={val => {
                                                if (val) {
                                                    handleStatusChange(bug._id, val as BugStatus);
                                                }
                                            }}
                                            data={[
                                                { value: 'open', label: 'Abierto' },
                                                { value: 'in_progress', label: 'En Progreso' },
                                                { value: 'resolved', label: 'Resuelto' },
                                                { value: 'closed', label: 'Cerrado' },
                                            ]}
                                            style={{ width: 155 }}
                                        />

                                        {isAdmin && (
                                            <Select
                                                size='xs'
                                                label='Asignar Developer'
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
                                            Ver Detalle
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
                        <Text fw={700}>Detalle del Ticket</Text>
                    </Group>
                }>
                {selectedBug && (
                    <Stack gap='md'>
                        <Group justify='space-between'>
                            <Badge
                                size='lg'
                                color={STATUS_COLORS[selectedBug.status] || 'gray'}
                                variant='filled'>
                                {STATUS_LABELS[selectedBug.status] || selectedBug.status}
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
                                <strong>Reportado por:</strong> @{selectedBug.reportedBy?.username}
                            </Text>
                            <Text size='sm'>
                                <strong>Asignado a:</strong>{' '}
                                {selectedBug.assignedToUsername
                                    ? `@${selectedBug.assignedToUsername}`
                                    : 'Sin asignar'}
                            </Text>
                        </Group>

                        {Array.isArray(selectedBug.media) && selectedBug.media.length > 0 && (
                            <Stack gap='xs'>
                                <Text fw={600} size='sm'>
                                    Archivos Adjuntos ({selectedBug.media.length})
                                </Text>
                                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing='sm'>
                                    {selectedBug.media.map((m, idx) => (
                                        <Card key={`${m.key}-${idx}`} withBorder radius='md' p='xs'>
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
                                                    <Text size='xs' truncate style={{ maxWidth: 160 }}>
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
                                                            rightSection={<IconExternalLink size={12} />}>
                                                            Abrir
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
                                label='Actualizar Estado'
                                value={selectedBug.status}
                                onChange={val => {
                                    if (val) {
                                        handleStatusChange(selectedBug._id, val as BugStatus);
                                    }
                                }}
                                data={[
                                    { value: 'open', label: 'Abierto' },
                                    { value: 'in_progress', label: 'En Progreso' },
                                    { value: 'resolved', label: 'Resuelto' },
                                    { value: 'closed', label: 'Cerrado' },
                                ]}
                            />

                            {isAdmin && (
                                <Select
                                    label='Reasignar Developer'
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
