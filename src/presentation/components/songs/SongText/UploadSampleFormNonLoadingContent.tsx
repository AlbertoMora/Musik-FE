import { DragEvent, RefObject, useContext } from 'react';
import UploadSampleFormInput from './UploadSampleFormInput';
import { UploadFormStoreContext } from './uploadFormStore';
import UploadSampleFormPreview from './UploadSampleFormPreview';
import { I18nTypes } from '@/i18n/dictionaries';

interface INonLoadingContentProps {
    i18n: I18nTypes['lyrics']['text'];
    onClick: () => void;
    onDrop: (e: DragEvent<HTMLButtonElement>) => void;
    onDragOver: (e: DragEvent<HTMLButtonElement>) => void;
    postRecord: () => void;
    inputRef: RefObject<HTMLInputElement | null>;
}

export const UploadSampleFormNonLoadingContent = ({
    i18n,
    onClick,
    onDragOver,
    onDrop,
    postRecord,
    inputRef,
}: INonLoadingContentProps) => {
    const uploadFormStore = useContext(UploadFormStoreContext);

    return uploadFormStore?.file ? (
        <UploadSampleFormPreview i18n={i18n} postRecord={postRecord} inputRef={inputRef} />
    ) : (
        <UploadSampleFormInput
            i18n={i18n}
            onClick={onClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
        />
    );
};
