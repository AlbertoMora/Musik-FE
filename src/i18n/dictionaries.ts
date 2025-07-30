import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import 'server-only';
import i18nTypesModel from './en.json';

export type I18nTypes = typeof i18nTypesModel;

export const DEFAULT_LANG = 'en';
export const LOCALE_HEADER = 'x-locale';

const dictionaries = {
    en: () => import('./en.json').then(module => module.default),
    es: () => import('./es.json').then(module => module.default),
};

export const getDictionary = async (locale: string) => {
    const selectedLocale = await dictionaries[locale as keyof typeof dictionaries]?.();
    if (!selectedLocale) {
        return dictionaries[DEFAULT_LANG]();
    }
    return selectedLocale;
};

export const getI18n = async (headers: () => Promise<ReadonlyHeaders>) => {
    const locale = (await headers()).get(LOCALE_HEADER) ?? DEFAULT_LANG;
    const I18n = await getDictionary(locale);
    return I18n;
};
