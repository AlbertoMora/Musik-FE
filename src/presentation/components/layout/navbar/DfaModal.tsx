'use-client';
import { Image, PinInput } from '@mantine/core';
import React, { useState } from 'react';
import H1 from '../../headings/H1';
import { IconLockAccess, IconX } from '@tabler/icons-react';
import { I18nTypes } from '@/i18n/dictionaries';

interface IDfaModalProps {
    i18n: I18nTypes['app']['navbar']['auth']['dfa'];
    userMail: string;
    active: boolean;
    setUserMail: (value: string) => void;
    setOwnState: (value: boolean) => void;
}

const DfaModal = ({ i18n, userMail, setUserMail, setOwnState, active }: IDfaModalProps) => {
    const [value, setValue] = useState('');
    const handleSubmit = (value: string) => {
        setValue(value);

        if (value.length !== 6) return;

        setUserMail('');
    };

    const closeForm = () => {
        setValue('');
        setOwnState(false);
    };

    return (
        active && (
            <div className='login-modal-container'>
                <form className='login-modal-dfa-form'>
                    <button onClick={closeForm} className='ssnn-button right-floating-button'>
                        <IconX />
                    </button>
                    <Image
                        src='/resources/musik-logo1.png'
                        alt='Musik Logo'
                        className='login-modal-logo'
                    />
                    <H1>{i18n.title}</H1>
                    <IconLockAccess size={200} />
                    <PinInput
                        value={value}
                        size='md'
                        length={6}
                        placeholder='*'
                        onChange={handleSubmit}
                    />
                    <p>{i18n.caption + userMail}</p>
                </form>
            </div>
        )
    );
};

export default DfaModal;
