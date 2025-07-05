import { NextResponse } from 'next/server';
import { DEFAULT_LANG, LOCALE_HEADER } from '@/i18n/dictionaries';
import type { NextRequest } from 'next/server';

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

export function middleware(request: NextRequest) {
    const locale = getLocaleFromBrowser(request) ?? DEFAULT_LANG;
    const response = NextResponse.next();
    response.headers.set(LOCALE_HEADER, locale);
    return response;
}
