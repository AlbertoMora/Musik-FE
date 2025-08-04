'use client';
import React, { useState } from 'react';
import H1 from '../../headings/H1';
import { Button, TextInput, Divider, Image, PasswordInput, Alert } from '@mantine/core';
import {
    IconAlertHexagon,
    IconBrandFacebook,
    IconBrandGoogle,
    IconBrandX,
    IconKey,
    IconUserPlus,
    IconX,
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { loginFormConfig } from './formConfig';
import { generateDeviceId, generateKeyPair, signValue } from '@/utils/crypto-utils';
import { signInAction, signInChallengeAction } from '@/infrastructure/adapters/auth/auth-actions';

import { I18nTypes } from '@/i18n/dictionaries';
import { AnimatedUnmountWrapper } from '../../animation/AnimationUnmountWrapper';

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
            if (!loginRes) return setShouldShowAlert(true);

            const { pubKey } = await generateKeyPair();
            const signedNonce = await signValue(loginRes.nonce);
            const deviceId = await generateDeviceId();
            const challengeRes = await signInChallengeAction({
                deviceId,
                rsaPubKey: pubKey,
                sessionId: loginRes.sessionId,
                signedNonce,
            });
            if (!challengeRes) return setShouldShowAlert(true);

            if (challengeRes.shouldVerifySession) {
                setUserMail(challengeRes.sendTo ?? '');
                setSessionId(loginRes.sessionId);
                setDfaModalState(true);
                form.reset();
                closeForm();
            } else {
                location.reload();
            }
        }
    };

    const closeForm = () => {
        //TODO: Hacer que este manejo de las animaciones sea más genérico
        /*TODO: Gestionar que cuando una animación se está ejecutando, no pueda ser redisparado el 
        cambio de estado*/
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
                    enter='animate__bounceInLeft'
                    exit='animate__backOutRight'>
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

                        <Divider className='w-full' />
                        <div className='w-full ssnn-container'>
                            <button type='button' className='ssnn-button fb-btn'>
                                <IconBrandFacebook size={25} />
                            </button>
                            <button type='button' className='ssnn-button x-btn'>
                                <IconBrandX size={25} />
                            </button>
                            <button type='button' className='ssnn-button google-btn'>
                                <IconBrandGoogle size={25} />
                            </button>
                        </div>
                        <span>{i18n.divider}</span>
                        <Button
                            type='button'
                            radius='xl'
                            variant='gradient'
                            onClick={() => {
                                setSignUpState(true);
                                closeForm();
                            }}
                            rightSection={<IconUserPlus size={20} />}
                            gradient={{ from: '#191335', to: '#4838d9', deg: 161 }}>
                            {i18n.signup_button}
                        </Button>
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
