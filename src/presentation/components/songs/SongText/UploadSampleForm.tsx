import React, { ChangeEvent, DragEvent, useContext, useMemo, useRef } from 'react';
import { StoreContext } from './songTextStore';
import { AnimatedUnmountWrapper } from '../../animation/AnimationUnmountWrapper';
import { IconX } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { I18nTypes } from '../../../../i18n/dictionaries';
import { UploadSampleActions } from './UploadSampleFormAction';
import {
    NotificationService,
    NotificationTypes,
} from '@/presentation/services/notification-service';
import UploadSampleFormLoading from './UploadSampleFormLoading';
import { createUploadFormStoreContext, UploadFormStoreContext } from './uploadFormStore';
import { UploadSampleFormNonLoadingContent } from './UploadSampleFormNonLoadingContent';

const UploadSampleForm = ({ i18n }: { i18n: I18nTypes['lyrics']['text'] }) => {
    const songTextStore = useContext(StoreContext);
    const useUploadFormStore = useMemo(() => createUploadFormStoreContext(), []);
    const uploadFormStore = useUploadFormStore();

    const ref = useRef<HTMLInputElement>(null);

    const onDrop = (e: DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        uploadFormStore?.setIsDragged(false);
        changeFile(e.dataTransfer.files);
    };

    const changeFile = (files?: FileList | null) => {
        const acceptedFileTypes = ['audio/mpeg', 'audio/vnd.wav', 'audio/ogg'];

        if (!files) {
            notifications.show({
                title: i18n.uploadModal.uploadProcess.errTitle,
                message: i18n.uploadModal.badFileType,
                color: 'red',
            });
            return;
        }
        const file = Array.from(files)[0];

        if (!file?.type || !acceptedFileTypes.includes(file.type)) {
            notifications.show({
                title: i18n.uploadModal.uploadProcess.errTitle,
                message: i18n.uploadModal.badFileType,
                color: 'red',
            });
            return;
        }

        uploadFormStore?.setFile(file);
    };

    const onClick = async () => {
        const input = ref.current;

        if (input) {
            input.click();
        }
    };

    const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        changeFile(e.target.files);
    };

    const onDragOver = (e: DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        uploadFormStore?.setIsDragged(true);
    };

    const onClose = () => {
        if (songTextStore?.shouldShowUploadModal) {
            songTextStore.toggleUploadModal();
            uploadFormStore?.setFile(null);
            uploadFormStore.setIsUploading(false);
            uploadFormStore.setIsProcessFinished(false);
            uploadFormStore.setIsDragged(false);
        }
    };

    const postRecord = async () => {
        const literals = i18n.uploadModal.uploadProcess;

        uploadFormStore.setIsUploading(true);

        const { url, key } = (await getPresignUrl(literals)) || {};

        if (!url || !key) return;

        const uploadRes = await uploadToS3(url, literals);
        if (!uploadRes) return;

        const updateRes = await UploadSampleActions.updateSong(key, songTextStore);

        if (updateRes) {
            sendMessage(NotificationTypes.ok, literals);
            uploadFormStore?.setIsSuccess(true);
        } else {
            sendMessage(NotificationTypes.warning, literals);
            uploadFormStore?.setIsSuccess(false);
        }
        uploadFormStore?.setIsProcessFinished(true);
    };

    const getPresignUrl = async (
        literals: I18nTypes['lyrics']['text']['uploadModal']['uploadProcess']
    ) => {
        const res = await UploadSampleActions.getPresignedUrl(
            uploadFormStore?.file,
            songTextStore?.id
        );

        if (!res?.url || !res.key) {
            sendMessage(NotificationTypes.error, literals);
            uploadFormStore?.setIsSuccess(false);
            uploadFormStore?.setIsProcessFinished(true);
            return;
        }
        return res;
    };

    const uploadToS3 = async (
        url: string,
        literals: I18nTypes['lyrics']['text']['uploadModal']['uploadProcess']
    ) => {
        const uploadRes = await UploadSampleActions.uploadToS3(
            uploadFormStore?.file,
            url,
            uploadFormStore?.setUploadProgress
        );

        if (!uploadRes) {
            sendMessage(NotificationTypes.warning, literals);
            uploadFormStore?.setIsSuccess(false);
            uploadFormStore?.setIsProcessFinished(true);
        }
        return uploadRes;
    };

    return (
        <UploadFormStoreContext.Provider value={uploadFormStore}>
            <AnimatedUnmountWrapper
                customClass='song-upload-animator'
                show={songTextStore?.shouldShowUploadModal ?? false}>
                <div className='song-upload-container'>
                    <input type='file' hidden ref={ref} onChange={onFileInputChange} />
                    <button
                        type='button'
                        onClick={onClose}
                        className='ssnn-button right-floating-button'>
                        <IconX />
                    </button>
                    {uploadFormStore?.isUploading ? (
                        <UploadSampleFormLoading
                            cancelProcessAction={() => {}}
                            i18n={i18n.uploadModal}
                        />
                    ) : (
                        <UploadSampleFormNonLoadingContent
                            inputRef={ref}
                            i18n={i18n}
                            onClick={onClick}
                            onDragOver={onDragOver}
                            onDrop={onDrop}
                            postRecord={postRecord}
                        />
                    )}
                </div>
            </AnimatedUnmountWrapper>
        </UploadFormStoreContext.Provider>
    );
};

const sendMessage = (
    type: NotificationTypes,
    i18n: I18nTypes['lyrics']['text']['uploadModal']['uploadProcess']
) => {
    let message: string = '';
    let title: string = '';
    const messageType =
        NotificationTypes.warning || NotificationTypes.error
            ? NotificationTypes.error
            : NotificationTypes.ok;
    switch (type) {
        case NotificationTypes.ok:
            message = i18n.ok;
            title = i18n.okTitle;
            break;
        case NotificationTypes.warning:
            message = i18n.clientErr;
            title = i18n.errTitle;
            break;
        default:
            message = i18n.serverErr;
            title = i18n.errTitle;
            break;
    }

    NotificationService.showMessage(message, messageType, title, 'top-center');
};

export default UploadSampleForm;
