'use client';

import React, { useMemo } from 'react';
import { Avatar, Skeleton } from '@mantine/core';
import { IconCoin, IconGauge, IconUsers } from '@tabler/icons-react';
import moment from 'moment';
import { ILocalSessionData } from '@/domain/auth/auth-gateway';
import { AccountPageI18n } from './account.types';

interface IAccountHeroProps {
    isLoading: boolean;
    sessionUser: ILocalSessionData['user'] | null;
    i18n: AccountPageI18n;
}

const AccountHero = ({ isLoading, sessionUser, i18n }: IAccountHeroProps) => {
    const displayName = useMemo(
        () =>
            [sessionUser?.name, sessionUser?.lastname].filter(Boolean).join(' ').trim() ||
            i18n.common.defaultDisplayName,
        [i18n.common.defaultDisplayName, sessionUser?.lastname, sessionUser?.name],
    );

    const username = sessionUser?.username ? `@${sessionUser.username}` : i18n.common.guestHandle;
    const profileInitial = displayName.charAt(0).toUpperCase();
    const createdAt = sessionUser?.creation_date
        ? moment(sessionUser.creation_date).format('DD/MM/yyyy')
        : null;

    return (
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
    );
};

export default AccountHero;
