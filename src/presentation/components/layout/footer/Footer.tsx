'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@mantine/core';
import { IconBrandGithub, IconBrandInstagram, IconBug, IconMail } from '@tabler/icons-react';
import { I18nTypes } from '@/i18n/dictionaries';
import { BugReportModal } from '@/presentation/components/bugs/BugReportModal';

interface FooterProps {
    i18n: I18nTypes['app']['footer'];
    isLogged?: boolean;
    version?: string;
}

const Footer = ({ i18n, isLogged = false, version = '0.1.0' }: FooterProps) => {
    const [bugModalOpened, setBugModalOpened] = useState(false);

    const currentYear = new Date().getFullYear();
    const footerLinks = [
        { label: i18n.links.home, href: '/' },
        { label: i18n.links.createLyrics, href: '/lyrics/create' },
        { label: i18n.links.myAccount, href: '/account' },
        { label: i18n.links.statistics, href: '/lyrics/statistics' },
    ];

    return (
        <footer className='footer'>
            <div className='footerInner'>
                <div className='brandBlock'>
                    <Link href='/' className='brandLink' aria-label={i18n.aria.home}>
                        <Image
                            src='/resources/musik-logo1.png'
                            alt={i18n.logoAlt}
                            className='brandLogo'
                            width={96}
                            height={32}
                        />
                    </Link>
                    <p className='brandText'>{i18n.description}</p>
                </div>

                <nav className='linksBlock' aria-label={i18n.aria.navigation}>
                    {footerLinks.map(link => (
                        <Link key={link.href} href={link.href} className='footerLink'>
                            {link.label}
                        </Link>
                    ))}
                    {isLogged && (
                        <Button
                            type='button'
                            color='red'
                            size='xs'
                            radius='md'
                            leftSection={<IconBug size={15} />}
                            onClick={() => setBugModalOpened(true)}
                            style={{ marginLeft: 8 }}>
                            {i18n.links.reportBug || 'Reportar un Bug'}
                        </Button>
                    )}
                </nav>

                <div className='socialBlock'>
                    <a
                        className='socialLink'
                        href='mailto:hello@musik.app'
                        aria-label={i18n.aria.email}>
                        <IconMail size={18} />
                    </a>
                    <a
                        className='socialLink'
                        href='https://github.com'
                        target='_blank'
                        rel='noreferrer'
                        aria-label={i18n.aria.github}>
                        <IconBrandGithub size={18} />
                    </a>
                    <a
                        className='socialLink'
                        href='https://instagram.com'
                        target='_blank'
                        rel='noreferrer'
                        aria-label={i18n.aria.instagram}>
                        <IconBrandInstagram size={18} />
                    </a>
                </div>
                <div className='footerMeta flex justify-center'>
                    <span>{i18n.meta.madeBy}</span>
                    <span className='footerVersion'>
                        v. {version}-{currentYear} - {i18n.meta.allRightsReserved} Sonnetia &copy;{' '}
                        {currentYear}
                    </span>
                </div>
            </div>

            {isLogged && (
                <BugReportModal
                    opened={bugModalOpened}
                    onClose={() => setBugModalOpened(false)}
                    texts={i18n.bugReportModal}
                />
            )}
        </footer>
    );
};

export default Footer;
