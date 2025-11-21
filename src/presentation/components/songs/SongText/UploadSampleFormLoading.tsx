import React, { useContext } from 'react';
import { UploadFormStoreContext } from './uploadFormStore';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { I18nTypes } from '@/i18n/dictionaries';
import { Button, Slider, Text } from '@mantine/core';

interface UploadSampleFormLoadingProps {
    i18n: I18nTypes['lyrics']['text']['uploadModal'];
    cancelProcessAction: () => void;
}

const animationUris = {
    uploading: '/resources/lottie-animations/loading/SonnetiaUploadingAnimation.json',
    ok: '/resources/lottie-animations/OkAnimation.json',
    fail: '/resources/lottie-animations/FailAnimation.json',
};

const UploadSampleFormLoading = ({ i18n, cancelProcessAction }: UploadSampleFormLoadingProps) => {
    const { isProcessFinished, isSuccess, uploadProgress } =
        useContext(UploadFormStoreContext) || {};

    const getAnimationState = () => {
        if (!isProcessFinished) {
            return { src: animationUris.uploading, loop: true, key: 'uploading' };
        }
        return {
            src: isSuccess ? animationUris.ok : animationUris.fail,
            loop: false,
            key: isSuccess ? 'success' : 'fail',
        };
    };

    const { src, loop, key } = getAnimationState();

    return (
        <div className='loading-container'>
            <DotLottieReact
                key={key} // 🔑 Key única fuerza re-mount cuando cambia el estado
                src={src}
                autoplay
                loop={loop}
                style={{ width: 668, height: 209 }}
            />
            {!isProcessFinished && (
                <>
                    <Text className='mt-3'>{i18n.uploadProcess.uploading}</Text>
                    <Slider
                        value={uploadProgress}
                        max={100}
                        thumbChildren={null}
                        classNames={{
                            root: 'loading-bar',
                            track: 'loading-bar-track',
                            bar: 'loading-bar-content',
                            thumb: 'loading-bar-no-thumb',
                        }}
                    />
                </>
            )}
            {isProcessFinished && (
                <Text>{isSuccess ? i18n.uploadProcess.ok : i18n.uploadProcess.clientErr}</Text>
            )}
            {!isProcessFinished && (
                <Button onClick={cancelProcessAction} className='mt-3 ' type='button'>
                    {i18n.cancelButton}
                </Button>
            )}
        </div>
    );
};

export default UploadSampleFormLoading;
