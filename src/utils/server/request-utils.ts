'use server';

import { commonsConstants, languageConstants } from '@/constants/commons-constants';
import { headers } from 'next/headers';

export const getUserAgent = async () => {
    return (await headers()).get('user-agent') ?? commonsConstants.unknown;
};

export const getLocale = async () => {
    return (await headers()).get('accept-language')?.split(',')[0] ?? languageConstants.en;
};
