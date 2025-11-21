import { animatedComponent, animationDuration, animations } from '@/constants/animation-constants';
import { I18nTypes } from '@/i18n/dictionaries';
import { Text } from '@mantine/core';
import { IconUpload } from '@tabler/icons-react';
import React, { DragEvent, useContext } from 'react';
import { UploadFormStoreContext } from './uploadFormStore';

export interface IUploadSampleFormInputProps {
    onDrop: (e: DragEvent<HTMLButtonElement>) => void;
    onDragOver: (e: DragEvent<HTMLButtonElement>) => void;
    onClick: () => void;
    i18n: I18nTypes['lyrics']['text'];
}

const UploadSampleFormInput = ({
    onDrop,
    i18n,
    onClick,

    onDragOver,
}: IUploadSampleFormInputProps) => {
    const uploadFormStore = useContext(UploadFormStoreContext);
    return (
        <button
            type='button'
            className='dragzone'
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={() => uploadFormStore?.setIsDragged(false)}
            onClick={onClick}
            aria-label={i18n.uploadModal.caption}>
            <IconUpload
                size={40}
                className={
                    uploadFormStore?.isDragged
                        ? `${animatedComponent} ${animations.attention_seekers.pulse} ${animationDuration.infinite}`
                        : undefined
                }
            />
            <Text>
                {uploadFormStore?.isDragged
                    ? i18n.uploadModal.leaveCaption
                    : i18n.uploadModal.caption}
            </Text>
            {!uploadFormStore?.isDragged && (
                <>
                    <hr className='self-stretch ml-5 mr-5 mt-5 mb-5' />
                    <Text>{i18n.uploadModal.clickCaption}</Text>
                </>
            )}
        </button>
    );
};

export default UploadSampleFormInput;
