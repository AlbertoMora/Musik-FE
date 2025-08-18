'use server';

import { UserFromMicroAdapter } from './users-from-micro-adapter';

export const getUsers = async (username: string, limit: number, offset: number) => {
    const usersAdapter = new UserFromMicroAdapter();
    return await usersAdapter.getUsers(username, limit, offset);
};
