import { IActionResponse } from '@/domain/auth/auth-gateway';
import { getSessionCookieValues } from '@/infrastructure/adapters/auth/auth-actions';
import { DictionaryItem } from '@/types/format-types';
import { IBasicWebResponse, responseCodes } from '@/types/web-types';
export interface ErrorType {
    msg: string;
    id: string;
}

export const webRequest = (url: string) => {
    return {
        post: async <Q>(body: Q, headers?: HeadersInit, isAuth?: boolean) => {
            let authHeaders = {};
            if (isAuth) {
                const [accessToken] = await getSessionCookieValues();
                authHeaders = { authorization: `Bearer ${accessToken}` };
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                    ...authHeaders,
                },
                body: JSON.stringify(body),
            });
            return res;
        },
        delete: async (id?: string | null, headers?: HeadersInit) => {
            const composedUrl = id ? `${url}/${id}` : url;
            const res = await fetch(composedUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
            });
            return res;
        },
        get: async (params?: DictionaryItem<string>, headers?: HeadersInit) => {
            const getUrl = new URL(url);

            if (params)
                Object.keys(params).forEach(key => {
                    getUrl.searchParams.append(key, params[key]);
                });

            const res = await fetch(getUrl.toString(), {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
            });
            return res;
        },
    };
};

export const webErrors = {
    auth01: {
        msg: 'Sign Up fail due to Database constraint or bad user information',
        id: 'auth01',
    },
    auth02: {
        msg: "User or Password doesn't match",
        id: 'auth02',
    },
    auth03: {
        msg: 'Login request has been rejected by server',
        id: 'auth03',
    },
    auth04: {
        msg: 'The device authentication confirmation has failed due to validator has sent wrong password',
        id: 'auth04',
    },
    auth05: {
        msg: 'The session verification cannot be executed do to token or database error. Please try again later',
        id: 'auth05',
    },
    auth06: {
        msg: 'token is null or empty',
        id: 'auth06',
    },
    auth07: {
        msg: "User doesn't have the required permissions to execute this action",
        id: 'auth07',
    },
    auth08: {
        msg: 'User is banned',
        id: 'auth08',
    },
    auth10: {
        msg: 'Cannot refresh token due to server error',
        id: 'auth10',
    },
    auth09: {
        msg: 'Refresh token is not present or is invalid',
        id: 'auth09',
    },
    auth11: {
        msg: 'Invalid challenge response',
        id: 'auth11',
    },
    auth12: {
        msg: 'Server failed to sign up user',
        id: 'auth12',
    },
    auth13: {
        msg: "User doesn't have valid contact info to send the verification code",
        id: 'auth13',
    },
    auth14: {
        msg: 'Invalid MFA parameters',
        id: 'auth14',
    },
    auth15: {
        msg: 'Invalid Session Id',
        id: 'auth15',
    },
    auth16: {
        msg: 'Invalid token',
        id: 'auth16',
    },
    perm01: {
        msg: 'Cannot get permission list due to server error',
        id: 'perm01',
    },
    perm02: {
        msg: 'Cannot create product due to constraint or server error',
        id: 'perm02',
    },
    role01: {
        msg: 'Cannot get role list due to server error',
        id: 'role01',
    },
    role02: {
        msg: 'Cannot create role due to server error',
        id: 'role02',
    },
    role03: {
        msg: 'Cannot edit role due to server error',
        id: 'role03',
    },
    role04: {
        msg: 'Cannot delete role due to server error',
        id: 'role04',
    },
    user01: {
        msg: 'Cannot get users list due to server error',
        id: 'user01',
    },
    vald01: {
        msg: 'There are validation errors on request',
        id: 'vald01',
    },
    ply01: {
        msg: 'Could get user coin info',
        id: 'ply01',
    },
    ply02: {
        msg: "User doesn't exists",
        id: 'ply02',
    },
    srv01: {
        msg: 'Server Error',
        id: 'srv01',
    },
} as const satisfies Record<string, ErrorType>;

export const getResponseData = async <T extends IBasicWebResponse>(
    res: Response,
    webError: string
): Promise<IActionResponse<T>> => {
    if (!res.ok) return { success: false, reason: webErrors.srv01.id };

    const data = (await res.json()) as T;
    if (data.status !== responseCodes.ok) return { success: false, reason: webError, data };
    return { success: true, data };
};
