'use client';

import React from 'react';
import { IconChevronRight } from '@tabler/icons-react';
import { AccountMenuId, IAccountMenuItem } from './account.types';

interface IAccountSidebarProps {
    menuTitle: string;
    menuItems: IAccountMenuItem[];
    activeSection: AccountMenuId;
    onSelectSection: (sectionId: AccountMenuId) => void;
}

const AccountSidebar = ({
    menuTitle,
    menuItems,
    activeSection,
    onSelectSection,
}: IAccountSidebarProps) => {
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
                </nav>
            </div>
        </aside>
    );
};

export default AccountSidebar;
