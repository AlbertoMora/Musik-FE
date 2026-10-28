import { Anchor, Breadcrumbs } from '@mantine/core';
import React from 'react';
import { v4 as uuid } from 'uuid';

import '@/presentation/styles/components/breadcrumbs.sass';

interface ICreateRepertoireBreadcrumbProps {
    home: string;
    repertoires: string;
    myRepertoires: string;
    create: string;
}

const getItems = ({ home, repertoires, myRepertoires, create }: ICreateRepertoireBreadcrumbProps) =>
    [
        { title: home, href: '/' },
        { title: repertoires, href: '/repertoires/my-repertoires' },
        { title: myRepertoires, href: '/repertoires/my-repertoires' },
        { title: create },
    ].map(item =>
        item.href ? (
            <Anchor href={item.href} key={uuid()} className="breadcrumb-anchor" size="sm">
                {item.title}
            </Anchor>
        ) : (
            item.title
        ),
    );

const CreateRepertoireBreadcrumb = (i18n: ICreateRepertoireBreadcrumbProps) => {
    return (
        <Breadcrumbs aria-label="Repertoires breadcrumb" className="self-start ml-5 mb-3">
            {getItems(i18n)}
        </Breadcrumbs>
    );
};

export default CreateRepertoireBreadcrumb;
