import { I18nTypes } from '@/i18n/dictionaries';
import { Button, Group, Text } from '@mantine/core';
import React, { RefObject, useContext } from 'react';
import MusicPlayer from '../MusicPlayer';
import { IconCancel, IconUpload } from '@tabler/icons-react';
import { UploadFormStoreContext } from './uploadFormStore';

interface IUploadSampleFormPreviewProps {
    i18n: I18nTypes['lyrics']['text'];
    postRecord: () => void;
    inputRef: RefObject<HTMLInputElement | null>;
}
const UploadSampleFormPreview = ({ i18n, postRecord, inputRef }: IUploadSampleFormPreviewProps) => {
    const uploadFormStore = useContext(UploadFormStoreContext);
    const file = uploadFormStore?.file as File;

    const onCancel = () => {
        if (inputRef.current) inputRef.current.value = '';
        uploadFormStore?.setFile(null);
    };
    return (
        <div className='preview-zone'>
            <Text>
                {i18n.uploadModal.songName}: {file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB
            </Text>
            <MusicPlayer i18n={i18n.musicPlayer} url={URL.createObjectURL(file)} />
            <Group>
                <Button
                    type='button'
                    color='red'
                    onClick={onCancel}
                    leftSection={<IconCancel size={15} />}>
                    {i18n.uploadModal.cancelButton}
                </Button>
                <Button type='button' rightSection={<IconUpload size={15} />} onClick={postRecord}>
                    {i18n.uploadModal.uploadButton}
                </Button>
            </Group>
        </div>
    );
};

export default UploadSampleFormPreview;
