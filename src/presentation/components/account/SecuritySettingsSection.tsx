'use client';

import React, { useState } from 'react';
import { Button, Checkbox, PasswordInput, PinInput } from '@mantine/core';
import {
    IconDeviceFloppy,
    IconDeviceMobileMessage,
    IconKey,
    IconLock,
    IconMail,
    IconShieldLock,
    IconX,
} from '@tabler/icons-react';
import { ILocalSessionData } from '@/domain/auth/auth-gateway';
import { DfaChannelType } from '@/domain/users/users-gateway';
import {
    updateDfaSettingsAction,
    updatePasswordAction,
} from '@/infrastructure/adapters/users/users-actions';
import { generateDeviceId, generateKeyPair } from '@/utils/crypto-utils';
import {
    NotificationService,
    NotificationTypes,
} from '@/presentation/services/notification-service';
import { AccountPageI18n } from './account.types';

interface ISecuritySettingsSectionProps {
    sessionUser: ILocalSessionData['user'] | null;
    hasPassword: boolean;
    onHasPasswordChange: (value: boolean) => void;
    dfaChannel: DfaChannelType;
    onDfaChannelChange: (channel: DfaChannelType) => void;
    i18n: AccountPageI18n;
}

const SecuritySettingsSection = ({
    sessionUser,
    hasPassword,
    onHasPasswordChange,
    dfaChannel,
    onDfaChannelChange,
    i18n,
}: ISecuritySettingsSectionProps) => {
    const [savingDfa, setSavingDfa] = useState(false);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);
    const [requiresPasswordDfa, setRequiresPasswordDfa] = useState(false);
    const [dfaSentTo, setDfaSentTo] = useState('');
    const [dfaOtpCode, setDfaOtpCode] = useState('');
    const [shouldTrustDevice, setShouldTrustDevice] = useState(false);

    const email = sessionUser?.email || i18n.common.notAvailable;
    const phone = sessionUser?.phone || i18n.common.notAvailable;
    const hasPhoneConfigured = Boolean(sessionUser?.phone && sessionUser.phone.trim());
    const isPassMinLen = newPassword.length >= 8;
    const doPasswordsMatch = newPassword === confirmPassword;
    const canSubmitPassword =
        !savingPassword &&
        isPassMinLen &&
        doPasswordsMatch &&
        (!requiresPasswordDfa || dfaOtpCode.length === 6);

    const handleSaveDfaChannel = async () => {
        setSavingDfa(true);
        const res = await updateDfaSettingsAction(dfaChannel);
        setSavingDfa(false);
        if (res.success && res.data) {
            onDfaChannelChange(res.data.dfaChannel);
            NotificationService.showMessage(
                i18n.sections.securitySettings.items.dfa.savedSuccess,
                NotificationTypes.ok,
                i18n.sections.securitySettings.items.dfa.title,
            );
        } else {
            NotificationService.showMessage(
                i18n.sections.securitySettings.items.dfa.savedError,
                NotificationTypes.error,
                i18n.sections.securitySettings.items.dfa.title,
            );
        }
    };

    const handlePasswordSubmit = async () => {
        if (!isPassMinLen || !doPasswordsMatch) return;
        setSavingPassword(true);
        try {
            const deviceId = await generateDeviceId();
            const { pubKey } = await generateKeyPair();

            const res = await updatePasswordAction({
                password: newPassword,
                deviceId,
                rsaPubKey: pubKey,
                code: requiresPasswordDfa ? dfaOtpCode : undefined,
                shouldDeviceSafe: requiresPasswordDfa ? shouldTrustDevice : undefined,
            });

            setSavingPassword(false);

            if (!res.success || !res.data) {
                NotificationService.showMessage(
                    i18n.sections.securitySettings.items.password.passwordError,
                    NotificationTypes.error,
                    i18n.sections.securitySettings.title,
                );
                return;
            }

            if (res.data.shouldVerifySession) {
                setRequiresPasswordDfa(true);
                setDfaSentTo(res.data.sendTo ?? '');
                setDfaOtpCode('');
                return;
            }

            onHasPasswordChange(true);
            setNewPassword('');
            setConfirmPassword('');
            setRequiresPasswordDfa(false);
            setDfaOtpCode('');
            setShouldTrustDevice(false);

            NotificationService.showMessage(
                i18n.sections.securitySettings.items.password.passwordSuccess,
                NotificationTypes.ok,
                i18n.sections.securitySettings.title,
            );
        } catch {
            setSavingPassword(false);
            NotificationService.showMessage(
                i18n.sections.securitySettings.items.password.passwordError,
                NotificationTypes.error,
                i18n.sections.securitySettings.title,
            );
        }
    };

    return (
        <article className='panelCard'>
            <div className='panelHeader'>
                <div className='panelHeaderTitleGroup'>
                    <IconLock size={20} />
                    <div>
                        <h2>{i18n.sections.securitySettings.title}</h2>
                        <p>{i18n.sections.securitySettings.subtitle}</p>
                    </div>
                </div>
            </div>
            <div className='featureList'>
                <div className='featureItem'>
                    <strong>{i18n.sections.securitySettings.items.dfa.title}</strong>
                    <span>{i18n.sections.securitySettings.items.dfa.description}</span>

                    <div className='dfaChannelOptions'>
                        <button
                            type='button'
                            onClick={() => onDfaChannelChange('email')}
                            className={`dfaChannelOption ${
                                dfaChannel === 'email' ? 'dfaChannelOptionActive' : ''
                            }`}>
                            <IconMail size={20} />
                            <div className='dfaChannelOptionText'>
                                <strong>
                                    {i18n.sections.securitySettings.items.dfa.emailOption}
                                </strong>
                                <small>{email}</small>
                            </div>
                        </button>

                        <button
                            type='button'
                            disabled={!hasPhoneConfigured}
                            onClick={() => onDfaChannelChange('sms')}
                            className={`dfaChannelOption ${
                                dfaChannel === 'sms' ? 'dfaChannelOptionActive' : ''
                            }`}>
                            <IconDeviceMobileMessage size={20} />
                            <div className='dfaChannelOptionText'>
                                <strong>
                                    {i18n.sections.securitySettings.items.dfa.smsOption}
                                </strong>
                                <small>{phone}</small>
                            </div>
                        </button>
                    </div>

                    {!hasPhoneConfigured && (
                        <small className='fieldStatusHint fieldStatusError'>
                            {i18n.sections.securitySettings.items.dfa.noPhoneHint}
                        </small>
                    )}

                    <div className='editAccountActions'>
                        <Button
                            type='button'
                            radius='xl'
                            variant='gradient'
                            loading={savingDfa}
                            leftSection={<IconDeviceFloppy size={16} />}
                            gradient={{ from: 'blue', to: 'cyan', deg: 161 }}
                            onClick={handleSaveDfaChannel}>
                            {i18n.sections.securitySettings.items.dfa.saveChannel}
                        </Button>
                    </div>
                </div>

                <div className='featureItem'>
                    <strong>
                        {hasPassword
                            ? i18n.sections.securitySettings.items.password.title
                            : i18n.sections.securitySettings.items.password.createTitle}
                    </strong>
                    <span>
                        {hasPassword
                            ? i18n.sections.securitySettings.items.password.description
                            : i18n.sections.securitySettings.items.password.createDescription}
                    </span>

                    <div className='fieldGrid'>
                        <div className='fieldItem'>
                            <span>
                                {i18n.sections.securitySettings.items.password.newPassword}
                            </span>
                            <PasswordInput
                                className='accountInput'
                                value={newPassword}
                                disabled={requiresPasswordDfa}
                                onChange={e => setNewPassword(e.currentTarget.value)}
                                placeholder={
                                    i18n.sections.securitySettings.items.password
                                        .passwordPlaceholder
                                }
                            />
                            {newPassword.length > 0 && !isPassMinLen && (
                                <small className='fieldStatusHint fieldStatusError'>
                                    {i18n.sections.securitySettings.items.password.minLengthHint}
                                </small>
                            )}
                        </div>

                        <div className='fieldItem'>
                            <span>
                                {i18n.sections.securitySettings.items.password.confirmPassword}
                            </span>
                            <PasswordInput
                                className='accountInput'
                                value={confirmPassword}
                                disabled={requiresPasswordDfa}
                                onChange={e => setConfirmPassword(e.currentTarget.value)}
                                placeholder={
                                    i18n.sections.securitySettings.items.password
                                        .confirmPlaceholder
                                }
                            />
                            {confirmPassword.length > 0 && !doPasswordsMatch && (
                                <small className='fieldStatusHint fieldStatusError'>
                                    {i18n.sections.securitySettings.items.password.mismatchHint}
                                </small>
                            )}
                        </div>
                    </div>

                    {requiresPasswordDfa && (
                        <div className='dfaVerificationBox'>
                            <IconShieldLock size={34} />
                            <h4>
                                {
                                    i18n.sections.securitySettings.items.password
                                        .dfaVerificationTitle
                                }
                            </h4>
                            <p>
                                {
                                    i18n.sections.securitySettings.items.password
                                        .dfaVerificationSubtitle
                                }{' '}
                                <strong>{dfaSentTo}</strong>
                            </p>
                            <PinInput
                                length={6}
                                size='md'
                                placeholder='*'
                                value={dfaOtpCode}
                                onChange={setDfaOtpCode}
                            />
                            <Checkbox
                                checked={shouldTrustDevice}
                                onChange={e => setShouldTrustDevice(e.currentTarget.checked)}
                                label={
                                    i18n.sections.securitySettings.items.password.trustDeviceLabel
                                }
                            />
                        </div>
                    )}

                    <div className='editAccountActions'>
                        {requiresPasswordDfa && (
                            <Button
                                type='button'
                                radius='xl'
                                variant='subtle'
                                color='gray'
                                leftSection={<IconX size={16} />}
                                disabled={savingPassword}
                                onClick={() => {
                                    setRequiresPasswordDfa(false);
                                    setDfaOtpCode('');
                                }}>
                                {i18n.sections.securitySettings.items.password.cancelVerification}
                            </Button>
                        )}
                        <Button
                            type='button'
                            radius='xl'
                            variant='gradient'
                            loading={savingPassword}
                            disabled={!canSubmitPassword}
                            leftSection={<IconKey size={16} />}
                            gradient={{ from: 'blue', to: 'cyan', deg: 161 }}
                            onClick={handlePasswordSubmit}>
                            {requiresPasswordDfa
                                ? i18n.sections.securitySettings.items.password.verifyAndSave
                                : hasPassword
                                  ? i18n.sections.securitySettings.items.password.savePassword
                                  : i18n.sections.securitySettings.items.password
                                        .createPasswordBtn}
                        </Button>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default SecuritySettingsSection;
