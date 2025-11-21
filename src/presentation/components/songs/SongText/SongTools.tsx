import React, { useContext } from 'react';
import FloatingButtonMenu from '../../FloatingButtonMenu/FloatingButtonMenu';
import { I18nTypes } from '@/i18n/dictionaries';
import FloatingButtonItem from '../../FloatingButtonMenu/FloatingButtonItem';
import { ISongtextStore, StoreContext } from './songTextStore';
import { IMenuCommonProps, menuItems } from './menuConfig';

interface ISongToolsProps {
    i18n: I18nTypes['lyrics']['text']['menuLabels'];
}

const SongTools = ({ i18n }: ISongToolsProps) => {
    const store = useContext(StoreContext);

    return (
        store && (
            <div className='song-tools'>
                {menuItems(store)
                    .filter(i => checkPermission(i, store.permissions))
                    ?.map(i => (
                        <FloatingButtonMenu
                            name={i18n[i.name as keyof typeof i18n]}
                            key={i.name}
                            buttonClassname='fbm-sm'
                            buttonLabel={i.Label}>
                            {i.children
                                ?.filter(c => checkPermission(c, store.permissions))
                                .map(c => (
                                    <FloatingButtonItem
                                        icon={c.Label}
                                        key={c.name}
                                        onClick={c.onClick}
                                        name={i18n[c.name as keyof typeof i18n]}
                                    />
                                ))}
                        </FloatingButtonMenu>
                    ))}
            </div>
        )
    );
};

const checkPermission = (i: IMenuCommonProps, permissions: ISongtextStore['permissions']) => {
    return (
        !i.permissionsToShow ||
        permissions?.find(p => i.permissionsToShow?.find(pt => pt === p.correlationId) && p.allowed)
    );
};

export default SongTools;
