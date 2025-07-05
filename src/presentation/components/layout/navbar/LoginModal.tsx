'use client';
import React from 'react';
import H1 from '../../headings/H1';
import { Button, TextInput, Divider, Image, PasswordInput } from '@mantine/core';
import {
    IconBrandFacebook,
    IconBrandGoogle,
    IconBrandX,
    IconKey,
    IconUserPlus,
    IconX,
} from '@tabler/icons-react';
import { I18nInputText } from '@/types/format-types';
import { useForm } from '@mantine/form';
import { loginFormConfig } from './formConfig';
import { generateKeyPair, signValue } from '@/utils/crypto-utils';
import { signInAction, signInChallengeAction } from '@/infrastructure/adapters/auth/auth-actions';
import { v4 as uuid } from 'uuid';

export interface ILogin18nProps {
    title: string;
    button: string;
    divider: string;
    username: I18nInputText;
    password: I18nInputText;
    signup_button: string;
}

interface ILoginModalProps {
    isOpen: boolean;
    setSignUpState: (value: boolean) => void;
    setOwnState: (value: boolean) => void;
    i18n: ILogin18nProps;
}

const LoginModal = ({ isOpen, setSignUpState, setOwnState, i18n }: ILoginModalProps) => {
    const form = useForm(loginFormConfig);

    const onFormSubmit = async () => {
        form.validate();

        if (form.isValid()) {
            const { username, password } = form.values;
            const loginRes = await signInAction({ username, password });
            if (!loginRes) return alert('Username or Password not valid'); //TODO: Replace with an info tab

            const { pubKey } = await generateKeyPair();
            const signedNonce = await signValue(loginRes.nonce);
            const challengeRes = await signInChallengeAction({
                deviceId: uuid(),
                rsaPubKey: pubKey,
                sessionId: loginRes.sessionId,
                signedNonce,
            });
            if (!challengeRes) return alert('Username or Password not valid'); //TODO: Replace with an info tab

            location.reload();
        }
    };

    const closeForm = () => {
        form.reset();
        setOwnState(false);
    };

    return (
        isOpen && (
            <div className='login-modal-container'>
                <form className='login-modal-form'>
                    <Image
                        src='/resources/musik-logo1.png'
                        alt='Musik Logo'
                        className='login-modal-logo'
                    />
                    <button onClick={closeForm} className='ssnn-button right-floating-button'>
                        <IconX />
                    </button>
                    <H1>{i18n.title}</H1>
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
                        <button type='button' className='ssnn-button'>
                            <IconBrandFacebook size={25} />
                        </button>
                        <button type='button' className='ssnn-button'>
                            <IconBrandX size={25} />
                        </button>
                        <button type='button' className='ssnn-button'>
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
            </div>
        )
    );
};

export default LoginModal;
