import React, { useContext } from 'react';
import FloatingButtonMenu from '../../FloatingButtonMenu/FloatingButtonMenu';
import { I18nTypes } from '@/i18n/dictionaries';
import FloatingButtonItem from '../../FloatingButtonMenu/FloatingButtonItem';
import { AnimatedUnmountWrapper } from '../../animation/AnimationUnmountWrapper';
import UploadSampleForm from './UploadSampleForm';
import { StoreContext } from './songTextStore';
import { menuItems } from './menuConfig';

interface ISongToolsProps {
    i18n: I18nTypes['lyrics']['text']['menuLabels'];
}

const SongTools = ({ i18n }: ISongToolsProps) => {
    const store = useContext(StoreContext);

    return (
        store && (
            <div className='song-tools'>
                <AnimatedUnmountWrapper show={store.shouldShowUploadModal}>
                    <UploadSampleForm />
                </AnimatedUnmountWrapper>
                {menuItems(store).map(i => (
                    <FloatingButtonMenu
                        name={i18n[i.name as keyof typeof i18n]}
                        key={i.name}
                        buttonClassname='fbm-sm'
                        buttonLabel={<i.Label />}>
                        {i.children.map(c => (
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

export default SongTools;
