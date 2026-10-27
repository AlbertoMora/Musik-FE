import { I18nTypes } from '@/i18n/dictionaries';
import { Icon } from '@tabler/icons-react';

export type AccountMenuId =
    | 'edit-account'
    | 'security-settings'
    | 'statistics'
    | 'creator-panel';

export type AccountPageI18n = I18nTypes['app']['accountPage'];

export interface IAccountMenuItem {
    id: AccountMenuId;
    label: string;
    description: string;
    icon: Icon;
}
