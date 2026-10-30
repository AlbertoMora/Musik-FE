'use server';

import { commonsConstants, languageConstants } from '@/constants/commons-constants';
import { headers } from 'next/headers';

export const getUserAgent = async () => {
    return (await headers()).get('user-agent') ?? commonsConstants.unknown;
};

export const getLocale = async () => {
    return (await headers()).get('accept-language')?.split(',')[0] ?? languageConstants.en;
};

export const getClientIpFromHeaders = async () => {
    const h = await headers();
    const candidates = [
        h.get('cf-connecting-ip'),
        h.get('x-real-ip'),
        h.get('x-client-ip'),
        h.get('x-forwarded-for')?.split(',')[0]?.trim(),
    ];
    for (const ip of candidates) {
        if (ip && ip.trim()) {
            return ip.trim().replace(/^::ffff:/, '');
        }
    }
    return undefined;
};
