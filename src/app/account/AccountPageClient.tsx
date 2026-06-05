'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Skeleton } from '@mantine/core';
import {
    IconChartAreaLine,
    IconChevronRight,
    IconCoin,
    IconGauge,
    IconLock,
    IconPencil,
    IconShieldLock,
    IconStar,
    IconUser,
    IconUsers,
} from '@tabler/icons-react';
import { getSessionInfoAction } from '@/infrastructure/adapters/auth/auth-actions';
import { I18nTypes } from '@/i18n/dictionaries';
import { ILocalSessionData } from '@/domain/auth/auth-gateway';

import moment from 'moment';

interface IAccountPageClientProps {
    i18n: I18nTypes['app']['accountPage'];
}

type MenuId = 'edit-account' | 'security-settings' | 'statistics' | 'creator-panel';

const AccountPageClient = ({ i18n }: IAccountPageClientProps) => {
    const [activeSection, setActiveSection] = useState<MenuId>('edit-account');
    const [isLoading, setIsLoading] = useState(true);
    const [sessionUser, setSessionUser] = useState<ILocalSessionData['user'] | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadSession = async () => {
            setIsLoading(true);
            const session = await getSessionInfoAction();

            if (!mounted) return;

            setSessionUser(session?.user ?? null);
            setIsLoading(false);
        };

        loadSession();

        return () => {
            mounted = false;
        };
    }, []);

    const menuItems = [
        {
            id: 'edit-account' as const,
            label: i18n.menu.editAccount.label,
            description: i18n.menu.editAccount.description,
            icon: IconPencil,
        },
        {
            id: 'security-settings' as const,
            label: i18n.menu.securitySettings.label,
            description: i18n.menu.securitySettings.description,
            icon: IconShieldLock,
        },
        {
            id: 'statistics' as const,
            label: i18n.menu.statistics.label,
            description: i18n.menu.statistics.description,
            icon: IconChartAreaLine,
        },
        {
            id: 'creator-panel' as const,
            label: i18n.menu.creatorPanel.label,
            description: i18n.menu.creatorPanel.description,
            icon: IconStar,
        },
    ];

    const displayName = useMemo(
        () =>
            [sessionUser?.name, sessionUser?.lastname].filter(Boolean).join(' ').trim() ||
            i18n.common.defaultDisplayName,
        [i18n.common.defaultDisplayName, sessionUser?.lastname, sessionUser?.name],
    );
    const username = sessionUser?.username ? `@${sessionUser.username}` : i18n.common.guestHandle;
    const email = sessionUser?.email || i18n.common.notAvailable;
    const phone = i18n.common.notAvailable;
    const profileInitial = displayName.charAt(0).toUpperCase();
    const createdAt = sessionUser?.creation_date
        ? moment(sessionUser.creation_date).format('DD/MM/yyyy')
        : null;

    const activeItem = menuItems.find(item => item.id === activeSection) ?? menuItems[0];
    const ActiveIcon = activeItem.icon;

    const renderActiveSection = () => {
        if (activeSection === 'edit-account') {
            return (
                <article className='panelCard'>
                    <div className='panelHeader'>
                        <IconUser size={20} />
                        <div>
                            <h2>{i18n.sections.editAccount.title}</h2>
                            <p>{i18n.sections.editAccount.subtitle}</p>
                        </div>
                    </div>
                    <div className='fieldGrid'>
                        <label className='fieldItem'>
                            <span>{i18n.sections.editAccount.fields.name}</span>
                            <div className='fieldValue'>
                                {sessionUser?.name || i18n.common.notAvailable}
                            </div>
                        </label>
                        <label className='fieldItem'>
                            <span>{i18n.sections.editAccount.fields.lastname}</span>
                            <div className='fieldValue'>
                                {sessionUser?.lastname || i18n.common.notAvailable}
                            </div>
                        </label>
                        <label className='fieldItem'>
                            <span>{i18n.sections.editAccount.fields.email}</span>
                            <div className='fieldValue'>{email}</div>
                        </label>
                        <label className='fieldItem'>
                            <span>{i18n.sections.editAccount.fields.phone}</span>
                            <div className='fieldValue'>{phone}</div>
                        </label>
                    </div>
                </article>
            );
        }

        if (activeSection === 'security-settings') {
            return (
                <article className='panelCard'>
                    <div className='panelHeader'>
                        <IconLock size={20} />
                        <div>
                            <h2>{i18n.sections.securitySettings.title}</h2>
                            <p>{i18n.sections.securitySettings.subtitle}</p>
                        </div>
                    </div>
                    <div className='featureList'>
                        <div className='featureItem'>
                            <strong>{i18n.sections.securitySettings.items.dfa.title}</strong>
                            <span>{i18n.sections.securitySettings.items.dfa.description}</span>
                        </div>
                        <div className='featureItem'>
                            <strong>{i18n.sections.securitySettings.items.password.title}</strong>
                            <span>{i18n.sections.securitySettings.items.password.description}</span>
                        </div>
                    </div>
                </article>
            );
        }

        if (activeSection === 'statistics') {
            return (
                <article className='panelCard'>
                    <div className='panelHeader'>
                        <IconChartAreaLine size={20} />
                        <div>
                            <h2>{i18n.sections.statistics.title}</h2>
                            <p>{i18n.sections.statistics.subtitle}</p>
                        </div>
                    </div>
                    <div className='metricsRow'>
                        <div className='metricCard'>
                            <span>{i18n.sections.statistics.cards.sitesVisited}</span>
                            <strong>128</strong>
                        </div>
                        <div className='metricCard'>
                            <span>{i18n.sections.statistics.cards.historyRecords}</span>
                            <strong>42</strong>
                        </div>
                        <div className='metricCard'>
                            <span>{i18n.sections.statistics.cards.lastVisit}</span>
                            <strong>{i18n.common.today}</strong>
                        </div>
                    </div>
                </article>
            );
        }

        return (
            <article className='panelCard'>
                <div className='panelHeader'>
                    <IconStar size={20} />
                    <div>
                        <h2>{i18n.sections.creatorPanel.title}</h2>
                        <p>{i18n.sections.creatorPanel.subtitle}</p>
                    </div>
                </div>
                <div className='creatorGrid'>
                    <div className='creatorStat'>
                        <span>{i18n.sections.creatorPanel.cards.createdSongsViewed}</span>
                        <strong>2,490</strong>
                    </div>
                    <div className='creatorStat'>
                        <span>{i18n.sections.creatorPanel.cards.moneyEarned}</span>
                        <strong>$1,240</strong>
                    </div>
                    <div className='creatorStat'>
                        <span>{i18n.sections.creatorPanel.cards.publishedSongs}</span>
                        <strong>18</strong>
                    </div>
                    <div className='creatorStat'>
                        <span>{i18n.sections.creatorPanel.cards.draftsReady}</span>
                        <strong>7</strong>
                    </div>
                </div>
            </article>
        );
    };

    return (
        <main className='accountPage'>
            <section className='heroCard'>
                <div className='heroGlow' />
                {isLoading ? (
                    <div className='heroLoading'>
                        <Skeleton circle height={112} width={112} />
                        <div className='heroLoadingText'>
                            <Skeleton height={18} width='42%' radius='xl' />
                            <Skeleton height={42} width='72%' radius='xl' />
                            <Skeleton height={18} width='28%' radius='xl' />
                        </div>
                    </div>
                ) : (
                    <div className='heroTop'>
                        <Avatar
                            src={sessionUser?.prof_pic}
                            radius='xl'
                            color='grape'
                            className='heroAvatar'>
                            {profileInitial}
                        </Avatar>
                        <div className='heroIdentity'>
                            <p className='heroKicker'>{i18n.hero.kicker}</p>
                            <h1 className='heroTitle'>{displayName}</h1>
                            <p className='heroHandle'>{username}</p>
                        </div>
                    </div>
                )}

                <div className='heroStats'>
                    <div className='statCard'>
                        <IconGauge size={18} />
                        <span>
                            {i18n.hero.stats.activeSince} {createdAt || i18n.common.notAvailable}
                        </span>
                    </div>
                    <div className='statCard'>
                        <IconUsers size={18} />
                        <span>{i18n.hero.stats.communityMember}</span>
                    </div>
                    <div className='statCard'>
                        <IconCoin size={18} />
                        <span>{i18n.hero.stats.creatorTools}</span>
                    </div>
                </div>
            </section>

            <section className='contentGrid'>
                <aside className='sidebar'>
                    <div className='sidebarCard'>
                        <p className='sidebarLabel'>{i18n.menuTitle}</p>
                        <nav className='sideMenu' aria-label={i18n.menuTitle}>
                            {menuItems.map(item => {
                                const Icon = item.icon;
                                const isActive = item.id === activeSection;

                                return (
                                    <button
                                        key={item.id}
                                        type='button'
                                        onClick={() => setActiveSection(item.id)}
                                        className={`sideMenuItem ${isActive ? 'sideMenuItemActive' : ''}`}>
                                        <span className='sideMenuIcon'>
                                            <Icon size={18} />
                                        </span>
                                        <span className='sideMenuText'>
                                            <strong>{item.label}</strong>
                                            <small>{item.description}</small>
                                        </span>
                                        <IconChevronRight size={16} className='sideMenuChevron' />
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

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
