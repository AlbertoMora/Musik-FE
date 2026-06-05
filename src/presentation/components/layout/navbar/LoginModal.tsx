'use client';
import React, { useState } from 'react';
import H1 from '../../headings/H1';
import { Button, TextInput, Divider, Image, PasswordInput, Alert, Typography } from '@mantine/core';
import { IconAlertHexagon, IconKey, IconX } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { loginFormConfig } from './formConfig';
import { generateDeviceId, generateKeyPair, signValue } from '@/utils/crypto-utils';
import {
    getGoogleKeyAction,
    signInAction,
    signInChallengeAction,
} from '@/infrastructure/adapters/auth/auth-actions';

import { I18nTypes } from '@/i18n/dictionaries';
import { AnimatedUnmountWrapper } from '../../animation/AnimationUnmountWrapper';
import { animations, animationSpeeds } from '@/constants/animation-constants';

import {
    NotificationService,
    NotificationTypes,
} from '@/presentation/services/notification-service';
import { authConstants } from '@/constants/auth-constants';
import { responseCodes } from '@/types/web-types';
import GoogleButton from '@/presentation/components/layout/navbar/GoogleButton';
import FacebookButton from '@/presentation/components/layout/navbar/FacebookButton';

interface ILoginModalProps {
    isOpen: boolean;
    setSignUpState: (value: boolean) => void;
    setDfaModalState: (value: boolean) => void;
    setOwnState: (value: boolean) => void;
    i18n: I18nTypes['app']['navbar']['auth']['login'];
    setUserMail: (value: string) => void;
    setSessionId: (value: string) => void;
}

const LoginModal = ({
    isOpen,
    setSignUpState,
    setDfaModalState,
    setOwnState,
    i18n,
    setUserMail,
    setSessionId,
}: ILoginModalProps) => {
    const form = useForm(loginFormConfig);
    const [shouldShowAlert, setShouldShowAlert] = useState(false);
    const [shouldClose, setShouldClose] = useState(false);

    const onFormSubmit = async () => {
        form.validate();

        if (form.isValid()) {
            const { username, password } = form.values;
            const loginRes = await signInAction({ username, password });
            if (!loginRes?.success || !loginRes?.data) return setShouldShowAlert(true);

            const { pubKey } = await generateKeyPair();
            const signedNonce = await signValue(loginRes.data.nonce);
            const deviceId = await generateDeviceId();
            const challengeRes = await signInChallengeAction({
                deviceId,
                rsaPubKey: pubKey,
                sessionId: loginRes.data.sessionId,
                signedNonce,
            });
            if (!challengeRes?.success || !challengeRes?.data) return setShouldShowAlert(true);

            if (challengeRes.data.shouldVerifySession) {
                setUserMail(challengeRes.data.sendTo ?? '');
                setSessionId(loginRes.data.sessionId);
                setDfaModalState(true);
                form.reset();
                closeForm();
            } else {
                location.reload();
            }
        }
    };

    const onGoogleLogin = async () => {
        const googleOAuthInfo = await getGoogleKeyAction();
        if (googleOAuthInfo?.status !== responseCodes.ok)
            return NotificationService.showMessage(
                i18n.oauth.googleInitiErr,
                NotificationTypes.error,
                'Error',
                'top-center',
            );

        const url = authConstants.getGoogleLoginUrl(googleOAuthInfo.clientId);
        window.open(url, 'Google Login', 'width=500,heigth=600');
    };

    const closeForm = () => {
        form.reset();
        setShouldClose(true);
    };

    const unmountAction = () => {
        setOwnState(false);
        setShouldClose(false);
    };
    return (
        isOpen && (
            <div className='login-modal-container'>
                <AnimatedUnmountWrapper
                    show={!shouldClose}
                    onUnmount={unmountAction}
                    enter={animations.entrances.bounceInLeft}
                    exit={animations.exits.backOutRight}
                    duration={animationSpeeds.fast}>
                    <form className='login-modal-form'>
                        <Image
                            src='/resources/musik-logo1.png'
                            alt='Musik Logo'
                            className='login-modal-logo'
                        />
                        <button
                            type='button'
                            onClick={closeForm}
                            className='ssnn-button right-floating-button'>
                            <IconX />
                        </button>
                        <H1>{i18n.title}</H1>
                        {shouldShowAlert && (
                            <LoginModalAlert
                                i18n={i18n.errorModal}
                                setIsActive={setShouldShowAlert}
                            />
                        )}
                        <TextInput
                            className='text-center w-full'
                            label={i18n.username.label}
                            id='username'
                            type='text'
                            {...form.getInputProps('username')}
                        />
                        <PasswordInput
                            className='text-center w-full'
                            label={i18n.password.label}
                            placeholder={i18n.password.placeholder}
                            id='password'
                            {...form.getInputProps('password')}
                        />
                        <Button
                            size='sm'
                            radius='xl'
                            variant='gradient'
                            onClick={onFormSubmit}
                            rightSection={<IconKey size={20} />}
                            gradient={{ from: 'blue', to: 'magenta', deg: 161 }}>
                            {i18n.button}
                        </Button>

                        <Typography variant='xs' className='text-center w-full mt-5 mb-2'>
                            {i18n.not_an_account}
                            <Button
                                type='button'
                                radius='xl'
                                variant='transparent'
                                onClick={() => {
                                    setSignUpState(true);
                                    closeForm();
                                }}>
                                {i18n.signup_button}
                            </Button>
                        </Typography>

                        <Divider className='w-full'>{i18n.divider}</Divider>
                        <div className='w-full ssnn-container'>
                            <GoogleButton text={i18n.oauth.google} onClick={onGoogleLogin} />
                            <FacebookButton text={i18n.oauth.fb} />
                        </div>
                    </form>
                </AnimatedUnmountWrapper>
            </div>
        )
    );
};

interface ILoginModalAlertProps {
    setIsActive: (value: boolean) => void;
    i18n: ILoginModalProps['i18n']['errorModal'];
}

const LoginModalAlert = ({ setIsActive, i18n }: ILoginModalAlertProps) => {
    return (
        <Alert
            variant='light'
            title={i18n.title}
            color='red'
            withCloseButton
            onClose={() => setIsActive(false)}
            icon={<IconAlertHexagon />}>
            {i18n.caption}
        </Alert>
    );
};

export default LoginModal;
