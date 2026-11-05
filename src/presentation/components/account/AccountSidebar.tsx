'use client';

import React, { useState } from 'react';
import { IconBug, IconChevronRight, IconShieldLock, IconTerminal2 } from '@tabler/icons-react';
import { AccountMenuId, IAccountMenuItem } from './account.types';
import { BugReportModal } from '../bugs/BugReportModal';
import { I18nTypes } from '@/i18n/dictionaries';

interface IAccountSidebarProps {
    menuTitle: string;
    menuItems: IAccountMenuItem[];
    activeSection: AccountMenuId;
    onSelectSection: (sectionId: AccountMenuId) => void;
    isAdmin?: boolean;
    isDeveloper?: boolean;
    i18nMenu?: I18nTypes['app']['accountPage']['menu'];
    bugModalTexts?: I18nTypes['app']['footer']['bugReportModal'];
}

const AccountSidebar = ({
    menuTitle,
    menuItems,
    activeSection,
    onSelectSection,
    isAdmin = false,
    isDeveloper = false,
    i18nMenu,
    bugModalTexts,
}: IAccountSidebarProps) => {
    const [bugModalOpened, setBugModalOpened] = useState(false);

    return (
        <aside className='sidebar'>
            <div className='sidebarCard'>
                <p className='sidebarLabel'>{menuTitle}</p>
                <nav className='sideMenu' aria-label={menuTitle}>
                    {menuItems.map(item => {
                        const Icon = item.icon;
                        const isActive = item.id === activeSection;

                        return (
                            <button
                                key={item.id}
                                type='button'
                                onClick={() => onSelectSection(item.id)}
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

                    {isAdmin && (
                        <a href='/admin/users' className='sideMenuItem'>
                            <span className='sideMenuIcon'>
                                <IconShieldLock size={18} />
                            </span>
                            <span className='sideMenuText'>
                                <strong>{i18nMenu?.admin?.label || 'Admin'}</strong>
                                <small>{i18nMenu?.admin?.description}</small>
                            </span>
                            <IconChevronRight size={16} className='sideMenuChevron' />
                        </a>
                    )}

                    {(isAdmin || isDeveloper) && (
                        <a href='/bugtracker' className='sideMenuItem'>
                            <span className='sideMenuIcon'>
                                <IconTerminal2 size={18} />
                            </span>
                            <span className='sideMenuText'>
                                <strong>{i18nMenu?.bugtracker?.label || 'Bugtracker'}</strong>
                                <small>{i18nMenu?.bugtracker?.description}</small>
                            </span>
                            <IconChevronRight size={16} className='sideMenuChevron' />
                        </a>
                    )}

                    <button
                        type='button'
                        onClick={() => setBugModalOpened(true)}
                        className='sideMenuItem'
                        style={{ borderColor: 'rgba(239, 68, 68, 0.35)' }}>
                        <span className='sideMenuIcon' style={{ color: '#ef4444' }}>
                            <IconBug size={18} />
                        </span>
                        <span className='sideMenuText'>
                            <strong style={{ color: '#ef4444' }}>
                                {i18nMenu?.reportBug?.label || 'Reportar un Bug'}
                            </strong>
                            <small>{i18nMenu?.reportBug?.description}</small>
                        </span>
                        <IconChevronRight size={16} className='sideMenuChevron' />
                    </button>
                </nav>
            </div>

            <BugReportModal
                opened={bugModalOpened}
                onClose={() => setBugModalOpened(false)}
                texts={bugModalTexts}
            />
        </aside>
    );
};

export default AccountSidebar;
