'use client';
import React, { useState } from 'react';

import { Anchor, Image, Menu, MenuTarget, MenuDropdown, MenuItem, Button } from '@mantine/core';

import '../../../styles/components/navbar.sass';
import LoginModal from './LoginModal';
import { IconLogin2 } from '@tabler/icons-react';
import SignUpModal from './SignUpModal';
import DfaModal from './DfaModal';
import { I18nTypes } from '@/i18n/dictionaries';

interface INavbarProps {
    isLogged: boolean;
    i18n: I18nTypes['app']['navbar'];
}

interface INavigationConfigItems {
    title: string;
    url?: string;
    children?: INavigationConfigItems[];
    requiredPermission?: string;
    requiredRole?: string;
}

const navigationConfig: INavigationConfigItems[] = [
    {
        title: 'Lyrics',
        children: [
            {
                title: 'Create Lyrics',
                url: '/create-lyrics',
            },
            {
                title: 'Stats',
                url: '/lyrics/statistics',
            },
        ],
    },
];

const navbarLinks = navigationConfig.map((n, i) => (
    <Menu key={`${i}-${n.title}`}>
        <MenuTarget>
            <div className='navbar-item'>{n.title}</div>
        </MenuTarget>

        <MenuDropdown>
            {n.children?.map((r, ix) => {
                return r.url ? (
                    <Anchor key={`${ix}${r.title}`} href={r.url}>
                        <MenuItem>{r.title}</MenuItem>
                    </Anchor>
                ) : null;
            })}
        </MenuDropdown>
    </Menu>
));

const DefaultNavbar = ({ isLogged, i18n }: INavbarProps) => {
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isSignUpModalOpen, setIsSignUpModalOpen] = useState(false);
    const [isDfaModalOpen, setIsDfaModalOpen] = useState(false);
    const [userMail, setUserMail] = useState('');

    return (
        <nav className='navbar'>
            <div className='navbar-container'>
                <Anchor className='logo-link'>
                    <Image
                        className='navbar-logo'
                        src='/resources/musik-logo1.png'
                        alt='musik logo'
                    />
                </Anchor>
                <div className='j-right'>
                    {isLogged ? (
                        <>{navbarLinks}</>
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
            />
        </nav>
    );
};

export default DefaultNavbar;
