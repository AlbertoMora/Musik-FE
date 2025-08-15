'use client';
import { Button, Divider, Image, TextInput } from '@mantine/core';
import { IconLogin2, IconUserPlus, IconX } from '@tabler/icons-react';
import React, { useState } from 'react';
import H1 from '../../headings/H1';
import { useForm } from '@mantine/form';
import { signUpFormConfig } from './formConfig';
import { signUpAction } from '@/infrastructure/adapters/auth/auth-actions';
import { AnimatedUnmountWrapper } from '../../animation/AnimationUnmountWrapper';
import { I18nTypes } from '@/i18n/dictionaries';
import { animations } from '@/constants/animation-constants';

interface ISignUpModalProps {
    isOpen: boolean;
    setLoginModalState: (value: boolean) => void;
    setOwnState: (value: boolean) => void;
    i18n: I18nTypes['app']['navbar']['auth']['signup'];
}
const SignUpModal = ({ isOpen, setLoginModalState, setOwnState, i18n }: ISignUpModalProps) => {
    const form = useForm(signUpFormConfig);
    const [shouldClose, setShouldClose] = useState(false);

    const onFormSubmit = async () => {
        form.validate();

        if (form.isValid()) {
            const { email, username, password } = form.values;
            const signUpData = {
                email,
                username,
                password,
            };
            form.setFieldValue('isFormLoading', true);
            const res = await signUpAction(signUpData);
            if (!res?.success) {
                form.reset();
                return alert('Session data was wrong');
            }
            location.reload();
        }
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
                    enter={animations.entrances.bounceInUp}
                    exit={animations.exits.backOutDown}>
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
                        <TextInput
                            className='text-center'
                            label={i18n.username.label}
                            placeholder={i18n.username.placeholder}
                            id='username'
                            type='text'
                            {...form.getInputProps('username')}
                        />
                        <TextInput
                            className='text-center'
                            label={i18n.email.label}
                            placeholder={i18n.email.placeholder}
                            id='email'
                            type='email'
                            {...form.getInputProps('email')}
                        />
                        <TextInput
                            className='text-center'
                            label={i18n.password.label}
                            placeholder={i18n.password.placeholder}
                            id='password'
                            type='password'
                            {...form.getInputProps('password')}
                        />
                        <TextInput
                            className='text-center'
                            label={i18n.conf_pass.label}
                            placeholder={i18n.conf_pass.placeholder}
                            id='conf_password'
                            type='password'
                            {...form.getInputProps('conf_password')}
                        />
                        <Button
                            size='sm'
                            radius='xl'
                            variant='gradient'
                            onClick={onFormSubmit}
                            rightSection={<IconUserPlus size={20} />}
                            gradient={{ from: 'blue', to: 'magenta', deg: 161 }}>
                            {i18n.button}
                        </Button>

                        <Divider className='w-full' />
                        <Button
                            type='button'
                            radius='xl'
                            variant='gradient'
                            onClick={() => {
                                setLoginModalState(true);
                                closeForm();
                            }}
                            rightSection={<IconLogin2 size={20} />}
                            gradient={{ from: '#191335', to: '#4838d9', deg: 161 }}>
                            {i18n.login_button}
                        </Button>
                    </form>
                </AnimatedUnmountWrapper>
            </div>
        )
    );
};

export default SignUpModal;
