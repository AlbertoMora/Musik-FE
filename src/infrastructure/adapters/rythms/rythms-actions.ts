'use server';
import { RythmsFromMicroAdapter } from './rythms-from-micro-adapter';

export const getRythmsAction = async (name: string) => {
    const rythmsAdapter = new RythmsFromMicroAdapter();
    const data = await rythmsAdapter.getRythms(name);
    return data ?? [];
};
