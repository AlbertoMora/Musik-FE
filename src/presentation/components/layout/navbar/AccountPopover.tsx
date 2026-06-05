'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, Menu, MenuDropdown, MenuItem, MenuTarget } from '@mantine/core';
import { IconChevronRight, IconLogout2, IconMail, IconUser } from '@tabler/icons-react';
import { I18nTypes } from '@/i18n/dictionaries';
import { getSessionInfoAction, signOutAction } from '@/infrastructure/adapters/auth/auth-actions';
import { ILocalSessionData } from '@/domain/auth/auth-gateway';
import { responseCodes } from '@/types/web-types';

interface IAccountPopoverProps {
    i18n: I18nTypes['app']['navbar']['account'];
}

const AccountPopover = ({ i18n }: IAccountPopoverProps) => {
    const [sessionInfo, setSessionInfo] = useState<ILocalSessionData['user'] | null>(null);

    useEffect(() => {
        let mounted = true;

        const loadSessionInfo = async () => {
            const sessionData = await getSessionInfoAction();
            if (mounted) {
                setSessionInfo(sessionData?.user ?? null);
            }
        };

        loadSessionInfo();

        return () => {
            mounted = false;
        };
    }, []);

    const signOut = async () => {
        const res = await signOutAction();
        if (res?.status !== responseCodes.ok) return alert('Session not closed');

        location.reload();
    };

    const displayName = useMemo(() => {
        const fullName = [sessionInfo?.name, sessionInfo?.lastname]
            .filter(Boolean)
            .join(' ')
            .trim();
        return fullName || sessionInfo?.username || i18n.profile.fallback;
    }, [i18n.profile.fallback, sessionInfo?.lastname, sessionInfo?.name, sessionInfo?.username]);

    const displayEmail = sessionInfo?.email || i18n.profile.fallback;
    const displayHandle = `@${sessionInfo?.username || i18n.profile.fallback}`;
    const avatarLabel = displayName.charAt(0).toUpperCase();

    return (
        <Menu withArrow position='bottom-end' shadow='md'>
            <MenuTarget>
                <Avatar
                    color='grape'
                    className='cursor-pointer account-menu-trigger-avatar'
                    src={sessionInfo?.prof_pic}>
                    {avatarLabel}
                </Avatar>
            </MenuTarget>

            <MenuDropdown className='navbar-item-dropdown account-menu-dropdown'>
                <div className='account-menu-profile material-card'>
                    <Avatar
                        color='grape'
                        className='account-menu-profile-avatar'
                        src={sessionInfo?.prof_pic}>
                        {avatarLabel}
                    </Avatar>
                    <div className='account-menu-header'>
                        <div className='account-menu-header-text'>
                            <p className='account-menu-title'>{displayName}</p>
                            <p className='account-menu-handle'>{displayHandle}</p>
                        </div>
                    </div>
                    <span className='account-menu-row'>
                        <IconMail size={15} stroke={1.8} />
                        <span className='account-menu-row-text'>{displayEmail}</span>
                    </span>
                </div>

                <a className='navbar-item-child account-menu-link' href='/account'>
                    <MenuItem className='account-menu-item account-menu-item-action'>
                        <span className='account-menu-item-content'>
                            <span className='account-menu-item-leading'>
                                <IconUser size={16} stroke={1.8} />
                                {i18n.children.myAccount}
                            </span>
                            <IconChevronRight size={15} stroke={2} />
                        </span>
                    </MenuItem>
                </a>
                <div className='account-menu-signout'>
                    <Button
                        type='button'
                        className='account-menu-signout-btn'
                        color='red'
                        leftSection={<IconLogout2 size={16} />}
                        onClick={signOut}>
                        {i18n.children.signout.button}
                    </Button>
                </div>
            </MenuDropdown>
        </Menu>
    );
};

export default AccountPopover;
