import jwt from 'jsonwebtoken';

export const getTokenData = <T>(token: string) => {
    const data = jwt.decode(token) as unknown as T;
    return data;
};
