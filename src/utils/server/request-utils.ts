'use server';

import { commonsConstants } from '@/constants/commons-constants';
import { headers } from 'next/headers';

export const getUserAgent = async () => {
    return (await headers()).get('user-agent') ?? commonsConstants.unknown;
};
