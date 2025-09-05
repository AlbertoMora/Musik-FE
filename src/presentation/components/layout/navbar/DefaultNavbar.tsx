'use client';
import React, { useState } from 'react';

import {
    Anchor,
    Image,
    Menu,
    MenuTarget,
    MenuDropdown,
    MenuItem,
    Button,
    Avatar,
} from '@mantine/core';

import '../../../styles/components/navbar.sass';
import LoginModal from './LoginModal';
import { IconLogin2, IconUser } from '@tabler/icons-react';
import SignUpModal from './SignUpModal';
import DfaModal from './DfaModal';
import { I18nTypes } from '@/i18n/dictionaries';
import { signOutAction } from '@/infrastructure/adapters/auth/auth-actions';
import { responseCodes } from '@/types/web-types';

interface INavbarProps {
    isLogged: boolean;
    i18n: I18nTypes['app']['navbar'];
}

interface INavigationConfigItems {
    title: string;
    url?: string;
    children?: INavigationConfigItems[];
    authorizationRelation?: string;
}

const DefaultNavbar = ({ isLogged, i18n }: INavbarProps) => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    const [isDfaModalOpen, setIsDfaModalOpen] = useState(false);
    const [userMail, setUserMail] = useState('');
    const [sessionId, setSessionId] = useState('');

    return (
        <nav className='navbar'>
            <div className='navbar-container'>
                <Anchor href='/' className='logo-link'>
                    <Image
                        className='navbar-logo'
                        src='/resources/musik-logo1.png'
                        alt='musik logo'
                    />
                </Anchor>
                <div className='j-right flex flex-row items-center gap-4'>
                    {isLogged ? (
                        <>
                            {navbarLinks(i18n)}
                            <AccountMenu i18n={i18n.account} />
                        </>
                    ) : (
                        <Button
                            size='sm'
                            radius='xl'
                            variant='gradient'
                            onClick={() => setIsLoginModalOpen(true)}
                            rightSection={<IconLogin2 size={20} />}
                            gradient={{ from: 'blue', to: 'magenta', deg: 161 }}>
                            {i18n.auth.login.button}
                        </Button>
                    )}
                </div>
            </div>
            <LoginModal
                i18n={i18n.auth.login}
                isOpen={isLoginModalOpen}
                setSignUpState={setIsSignUpModalOpen}
                setOwnState={setIsLoginModalOpen}
                setUserMail={setUserMail}
                setDfaModalState={setIsDfaModalOpen}
                setSessionId={setSessionId}
            />
            <SignUpModal
                i18n={i18n.auth.signup}
                isOpen={isSignUpModalOpen}
                setLoginModalState={setIsLoginModalOpen}
                setOwnState={setIsSignUpModalOpen}
            />
            <DfaModal
                userMail={userMail}
                i18n={i18n.auth.dfa}
                setUserMail={setUserMail}
                active={isDfaModalOpen}
                setOwnState={setIsDfaModalOpen}
                sessionId={sessionId}
                setSessionId={setSessionId}
            />
        </nav>
    );
};

interface IAccountMenuProps {
    i18n: INavbarProps['i18n']['account'];
}

const AccountMenu = ({ i18n }: IAccountMenuProps) => {
    const signOut = async () => {
        const res = await signOutAction();
        if (res?.status !== responseCodes.ok) return alert('Session not closed');

        location.reload();
    };

    return (
        <Menu withArrow>
            <MenuTarget>
                <Avatar color='grape' className='cursor-pointer'>
                    A
                </Avatar>
            </MenuTarget>

            <MenuDropdown className='navbar-item-dropdown'>
                <a className='navbar-item-child' href='/account'>
                    <MenuItem className='account-menu-item'>
                        <span className='flex flex-row items-start justify-center gap-2'>
                            <IconUser size={16} />
                            {i18n.children.myAccount}
                        </span>
                    </MenuItem>
                </a>
                <div className='account-menu-signout'>
                    <Button type='button' onClick={signOut}>
                        {i18n.children.signout.button}
                    </Button>
                </div>
            </MenuDropdown>
        </Menu>
    );
};

const navigationConfig = (i18n: INavbarProps['i18n']): INavigationConfigItems[] => [
    {
        title: i18n.lyrics.title,
        children: [
            {
                title: i18n.lyrics.children.createLyrics,
                url: '/lyrics/create',
            },
            {
                title: i18n.lyrics.children.stats,
                url: '/lyrics/statistics',
            },
        ],
    },
    {
        title: i18n.repertoires.title,
        children: [
            {
                title: i18n.repertoires.children.createRepertoire,
                url: '/repertoires/create',
            },
            {
                title: i18n.repertoires.children.myRepertoires,
                url: '/repertoires/my-repertoires',
            },
        ],
    },
    {
        title: i18n.folders.title,
        children: [
            {
                title: i18n.folders.children.createFolder,
                url: '/folders/create',
            },
            {
                title: i18n.folders.children.myFolders,
                url: '/folders/my-folders',
            },
        ],
    },
    {
        title: i18n.books.title,
        children: [
            {
                title: i18n.books.children.createBook,
                url: '/books/create',
            },
            {
                title: i18n.books.children.myBooks,
                url: '/books/my-books',
            },
        ],
    },
];

const navbarLinks = (i18n: INavbarProps['i18n']) =>
    navigationConfig(i18n).map((n, i) => (
        <Menu withArrow key={`${i}-${n.title}`}>
            <MenuTarget>
                <div className='navbar-item'>{n.title}</div>
            </MenuTarget>

            <MenuDropdown className='navbar-item-dropdown'>
                {n.children?.map((r, ix) => {
                    return r.url ? (
                        <a className='navbar-item-child' key={`${ix}${r.title}`} href={r.url}>
                            <MenuItem>{r.title}</MenuItem>
                        </a>
                    ) : null;
                })}
            </MenuDropdown>
        </Menu>
    ));

export default DefaultNavbar;
