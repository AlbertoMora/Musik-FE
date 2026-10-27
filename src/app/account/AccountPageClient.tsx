'use client';

import React, { useEffect, useState } from 'react';
import { Skeleton } from '@mantine/core';
import {
    IconChartAreaLine,
    IconPencil,
    IconShieldLock,
    IconStar,
} from '@tabler/icons-react';
import { getSessionInfoAction } from '@/infrastructure/adapters/auth/auth-actions';
import { getSecuritySettingsAction } from '@/infrastructure/adapters/users/users-actions';
import { getUserSongHistoryAction } from '@/infrastructure/adapters/songs/songs-actions';
import { I18nTypes } from '@/i18n/dictionaries';
import { ILocalSessionData } from '@/domain/auth/auth-gateway';
import { DfaChannelType } from '@/domain/users/users-gateway';
import { ISongHistoryItemDTO } from '@/domain/songs/song-gateway';
import AccountHero from '@/presentation/components/account/AccountHero';
import AccountSidebar from '@/presentation/components/account/AccountSidebar';
import EditAccountSection from '@/presentation/components/account/EditAccountSection';
import SecuritySettingsSection from '@/presentation/components/account/SecuritySettingsSection';
import StatisticsSection from '@/presentation/components/account/StatisticsSection';
import CreatorPanelSection from '@/presentation/components/account/CreatorPanelSection';
import {
    AccountMenuId,
    IAccountMenuItem,
} from '@/presentation/components/account/account.types';

interface IAccountPageClientProps {
    i18n: I18nTypes['app']['accountPage'];
}

const HISTORY_PAGE_SIZE = 5;

const AccountPageClient = ({ i18n }: IAccountPageClientProps) => {
    const [activeSection, setActiveSection] = useState<AccountMenuId>('edit-account');
    const [isLoading, setIsLoading] = useState(true);
    const [sessionUser, setSessionUser] = useState<ILocalSessionData['user'] | null>(null);

    // Security Settings State
    const [hasPassword, setHasPassword] = useState<boolean>(true);
    const [dfaChannel, setDfaChannel] = useState<DfaChannelType>('email');

    // Statistics & History State
    const [historyPage, setHistoryPage] = useState(1);
    const [isHistoryLoading, setIsHistoryLoading] = useState(false);
    const [historyItems, setHistoryItems] = useState<ISongHistoryItemDTO[]>([]);
    const [historyTotalCount, setHistoryTotalCount] = useState(0);
    const [statsSummary, setStatsSummary] = useState<{
        sitesVisited: number;
        historyRecords: number;
        lastVisit: string | null;
    }>({
        sitesVisited: 0,
        historyRecords: 0,
        lastVisit: null,
    });

    useEffect(() => {
        let mounted = true;

        const loadSession = async () => {
            setIsLoading(true);
            const [session, securityRes, historyRes] = await Promise.all([
                getSessionInfoAction(),
                getSecuritySettingsAction(),
                getUserSongHistoryAction(HISTORY_PAGE_SIZE, 0),
            ]);

            if (!mounted) return;

            setSessionUser(session?.user ?? null);

            if (securityRes.success && securityRes.data) {
                setHasPassword(securityRes.data.hasPassword);
                setDfaChannel(securityRes.data.dfaChannel);
            }

            if (historyRes.success && historyRes.data) {
                setStatsSummary(historyRes.data.stats);
                setHistoryItems(historyRes.data.history);
                setHistoryTotalCount(historyRes.data.count);
            }

            setIsLoading(false);
        };

        loadSession();

        return () => {
            mounted = false;
        };
    }, []);

    const handleHistoryPageChange = async (page: number) => {
        setHistoryPage(page);
        setIsHistoryLoading(true);
        const offset = (page - 1) * HISTORY_PAGE_SIZE;
        const res = await getUserSongHistoryAction(HISTORY_PAGE_SIZE, offset);
        setIsHistoryLoading(false);

        if (res.success && res.data) {
            setStatsSummary(res.data.stats);
            setHistoryItems(res.data.history);
            setHistoryTotalCount(res.data.count);
        }
    };

    const menuItems: IAccountMenuItem[] = [
        {
            id: 'edit-account',
            label: i18n.menu.editAccount.label,
            description: i18n.menu.editAccount.description,
            icon: IconPencil,
        },
        {
            id: 'security-settings',
            label: i18n.menu.securitySettings.label,
            description: i18n.menu.securitySettings.description,
            icon: IconShieldLock,
        },
        {
            id: 'statistics',
            label: i18n.menu.statistics.label,
            description: i18n.menu.statistics.description,
            icon: IconChartAreaLine,
        },
        {
            id: 'creator-panel',
            label: i18n.menu.creatorPanel.label,
            description: i18n.menu.creatorPanel.description,
            icon: IconStar,
        },
    ];

    const activeItem = menuItems.find(item => item.id === activeSection) ?? menuItems[0];
    const ActiveIcon = activeItem.icon;

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'edit-account':
                return (
                    <EditAccountSection
                        sessionUser={sessionUser}
                        onUserUpdated={setSessionUser}
                        i18n={i18n}
                    />
                );
            case 'security-settings':
                return (
                    <SecuritySettingsSection
                        sessionUser={sessionUser}
                        hasPassword={hasPassword}
                        onHasPasswordChange={setHasPassword}
                        dfaChannel={dfaChannel}
                        onDfaChannelChange={setDfaChannel}
                        i18n={i18n}
                    />
                );
            case 'statistics':
                return (
                    <StatisticsSection
                        statsSummary={statsSummary}
                        historyItems={historyItems}
                        historyTotalCount={historyTotalCount}
                        historyPage={historyPage}
                        pageSize={HISTORY_PAGE_SIZE}
                        isHistoryLoading={isHistoryLoading}
                        onPageChange={handleHistoryPageChange}
                        i18n={i18n}
                    />
                );
            case 'creator-panel':
            default:
                return <CreatorPanelSection i18n={i18n} />;
        }
    };

    return (
        <main className='accountPage'>
            <AccountHero isLoading={isLoading} sessionUser={sessionUser} i18n={i18n} />

            <section className='contentGrid'>
                <AccountSidebar
                    menuTitle={i18n.menuTitle}
                    menuItems={menuItems}
                    activeSection={activeSection}
                    onSelectSection={setActiveSection}
                />

                <div className='sections'>
                    {isLoading ? (
                        <article className='panelCard'>
                            <div className='panelHeader'>
                                <Skeleton height={20} width={20} circle />
                                <div className='panelSkeletonTitle'>
                                    <Skeleton height={20} width='38%' radius='xl' />
                                    <Skeleton height={14} width='62%' radius='xl' />
                                </div>
                            </div>
                            <div className='panelSkeletonBody'>
                                <Skeleton height={90} radius='lg' />
                                <Skeleton height={90} radius='lg' />
                                <Skeleton height={90} radius='lg' />
                            </div>
                        </article>
                    ) : (
                        <>
                            <div className='activeSectionHeader'>
                                <div className='activeSectionBadge'>
                                    <ActiveIcon size={18} />
                                    <span>{activeItem.label}</span>
                                </div>
                                <p>{activeItem.description}</p>
                            </div>
                            {renderActiveSection()}
                        </>
                    )}
                </div>
            </section>
        </main>
    );
};

export default AccountPageClient;
