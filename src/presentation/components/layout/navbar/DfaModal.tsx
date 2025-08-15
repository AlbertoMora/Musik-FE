'use-client';
import { Checkbox, Image, PinInput } from '@mantine/core';
import React, { useState } from 'react';
import H1 from '../../headings/H1';
import { IconLockAccess, IconX } from '@tabler/icons-react';
import { I18nTypes } from '@/i18n/dictionaries';
import { AnimatedUnmountWrapper } from '../../animation/AnimationUnmountWrapper';
import { signValue } from '@/utils/crypto-utils';
import { checkMfaAction } from '@/infrastructure/adapters/auth/auth-actions';
import { animations } from '@/constants/animation-constants';
interface IDfaModalProps {
    i18n: I18nTypes['app']['navbar']['auth']['dfa'];
    userMail: string;
    sessionId: string;
    active: boolean;
    setUserMail: (value: string) => void;
    setSessionId: (value: string) => void;
    setOwnState: (value: boolean) => void;
}

const DfaModal = ({
    i18n,
    userMail,
    setUserMail,
    setOwnState,
    setSessionId,
    sessionId,
    active,
}: IDfaModalProps) => {
    const [value, setValue] = useState('');
    const [shouldDeviceSafe, setShouldDeviceSafe] = useState(false);
    const [shouldClose, setShouldClose] = useState(false);
    const handleSubmit = async (value: string) => {
        setValue(value);

        if (value.length !== 6) return;

        const signature = await signValue(value);
        const res = await checkMfaAction({
            code: value,
            signature,
            sessionId,
            shouldDeviceSafe,
        });

        if (res?.data?.attempts && res?.data?.attempts < 3) return setValue('');

        if (res?.data?.attempts && res?.data?.attempts >= 3) return closeForm();

        location.reload();
    };

    const closeForm = () => {
        setValue('');
        setUserMail('');
        setSessionId('');
        setShouldClose(true);
    };

    const unmountAction = () => {
        setOwnState(false);
        setShouldClose(false);
    };

    return (
        active && (
            <div className='login-modal-container'>
                <AnimatedUnmountWrapper
                    show={!shouldClose}
                    onUnmount={unmountAction}
                    enter={animations.entrances.bounceInUp}
                    exit={animations.exits.backOutDown}>
                    <form className='login-modal-dfa-form'>
                        <button
                            type='button'
                            onClick={closeForm}
                            className='ssnn-button right-floating-button'>
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
                        <p className='text-center'>{i18n.caption + userMail}</p>
                        <Checkbox
                            onChange={e => setShouldDeviceSafe(e.target.checked)}
                            checked={shouldDeviceSafe}
                            label={i18n.isSecure}
                        />
                    </form>
                </AnimatedUnmountWrapper>
            </div>
        )
    );
};

export default DfaModal;
