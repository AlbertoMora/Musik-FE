import { NextResponse } from 'next/server';
import { DEFAULT_LANG, LOCALE_HEADER } from '@/i18n/dictionaries';
import type { NextRequest } from 'next/server';
import { AuthAdapterFromMicro } from './infrastructure/adapters/auth/auth-adapter-from-micro';
import { authConstants } from './constants/auth-constants';
import { ISessionResponseDTO } from './domain/auth/auth-gateway';
import { getTokenData } from './utils/jwt-utils';
import { IRefreshTokenDataModel } from './infrastructure/models/SessionModel';
import { commonsConstants } from './constants/commons-constants';

const getLocaleFromBrowser = (request: NextRequest): string | null => {
    const supportedLocales = ['en', 'es'];
    const acceptLanguage = request.headers.get('accept-language');

    if (!acceptLanguage) return DEFAULT_LANG;

    const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0]);
    for (const lang of languages) {
        if (supportedLocales.includes(lang)) {
            return lang;
        }
    }
    return DEFAULT_LANG;
};

export async function middleware(request: NextRequest) {
    if (
        request.nextUrl.pathname.startsWith('/_next') || // archivos internos de Next
        request.nextUrl.pathname.startsWith('/api') || // rutas API
        /\.(.*)$/.exec(request.nextUrl.pathname) // archivos con extensión (.css, .js, .png, etc.)
    ) {
        return NextResponse.next();
    }

    const locale = getLocaleFromBrowser(request) ?? DEFAULT_LANG;
    const response = NextResponse.next();
    response.headers.set(LOCALE_HEADER, locale);

    await checkAndRefreshSession(request, response);

    return response;
}

export const checkAndRefreshSession = async (req: NextRequest, resp: NextResponse) => {
    const [accessToken, refreshToken] = getSessionCookieValues(req) ?? [];
    const authAdapter = new AuthAdapterFromMicro();

    //Si no existen tokens no hace nada porque la sessión es inválida
    if (!accessToken || !refreshToken) return;
    const userAgent = req.headers.get('user-agent') ?? commonsConstants.unknown;
    const res = await authAdapter.checkSession(accessToken, userAgent);

    //Si la respuesta del checkeo es success no hace nada porque la sesión es válida
    if (res.success) return;

    const refreshRes = await authAdapter.refreshSession(refreshToken, userAgent);

    if (!refreshRes.data || !refreshRes.success) {
        //Si no se puede refrescar la sesión, se borra la cookie de sesión
        resp.cookies.delete(authConstants.sessionCookieKey);
    } else {
        //Si no se establece la cookie de sesión con los nuevos tokens
        setSessionCookie(resp, refreshRes.data);
    }
    return resp;
};

const getSessionCookieValues = (req: NextRequest) => {
    const sessionCookie = req.cookies.get(authConstants.sessionCookieKey)?.value;
    const [accessToken, refreshToken] = sessionCookie?.split(':') ?? [];
    if (!accessToken || !refreshToken) return null;

    return [accessToken, refreshToken];
};

const setSessionCookie = (res: NextResponse, data: ISessionResponseDTO) => {
    const refreshTokenData = getTokenData<IRefreshTokenDataModel>(data.refreshToken);
    res.cookies.set(authConstants.sessionCookieKey, `${data.accessToken}:${data.refreshToken}`, {
        httpOnly: true,
        secure: true,
        expires: new Date(refreshTokenData.exp * 1000),
        sameSite: 'strict',
        path: '/',
    });
};
