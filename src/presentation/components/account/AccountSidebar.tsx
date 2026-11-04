'use client';

import React, { useState } from 'react';
import { IconBug, IconChevronRight, IconShieldLock, IconTerminal2 } from '@tabler/icons-react';
import { AccountMenuId, IAccountMenuItem } from './account.types';
import { BugReportModal } from '../bugs/BugReportModal';

interface IAccountSidebarProps {
    menuTitle: string;
    menuItems: IAccountMenuItem[];
    activeSection: AccountMenuId;
    onSelectSection: (sectionId: AccountMenuId) => void;
    isAdmin?: boolean;
    isDeveloper?: boolean;
}

const AccountSidebar = ({
    menuTitle,
    menuItems,
    activeSection,
    onSelectSection,
    isAdmin = false,
    isDeveloper = false,
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
                                <strong>Admin</strong>
                                <small>Gestión de usuarios y foro de moderación</small>
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
                                <strong>Bugtracker</strong>
                                <small>Seguimiento y estado de reportes de bugs</small>
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
                            <strong style={{ color: '#ef4444' }}>Reportar un Bug</strong>
                            <small>Envía detalles, capturas o videos de un problema</small>
                        </span>
                        <IconChevronRight size={16} className='sideMenuChevron' />
                    </button>
                </nav>
            </div>

            <BugReportModal
                opened={bugModalOpened}
                onClose={() => setBugModalOpened(false)}
            />
        </aside>
    );
};

export default AccountSidebar;
