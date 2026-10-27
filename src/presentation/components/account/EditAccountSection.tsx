'use client';

import React, { useEffect, useState } from 'react';
import { Button, Loader, Select, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconCheck, IconDeviceFloppy, IconPencil, IconUser, IconX } from '@tabler/icons-react';
import { ILocalSessionData } from '@/domain/auth/auth-gateway';
import {
    checkUserAvailabilityAction,
    updateUserAccountAction,
} from '@/infrastructure/adapters/users/users-actions';
import {
    NotificationService,
    NotificationTypes,
} from '@/presentation/services/notification-service';
import { AccountPageI18n } from './account.types';

const COUNTRY_CODE_OPTIONS = [
    { value: '+506', label: '🇨🇷 +506 (CR)' },
    { value: '+52', label: '🇲🇽 +52 (MX)' },
    { value: '+1', label: '🇺🇸 +1 (US/CA)' },
    { value: '+57', label: '🇨🇴 +57 (CO)' },
    { value: '+34', label: '🇪🇸 +34 (ES)' },
    { value: '+54', label: '🇦🇷 +54 (AR)' },
    { value: '+56', label: '🇨🇱 +56 (CL)' },
    { value: '+51', label: '🇵🇪 +51 (PE)' },
    { value: '+507', label: '🇵🇦 +507 (PA)' },
    { value: '+502', label: '🇬🇹 +502 (GT)' },
    { value: '+503', label: '🇸🇻 +503 (SV)' },
    { value: '+504', label: '🇭🇳 +504 (HN)' },
    { value: '+505', label: '🇳🇮 +505 (NI)' },
    { value: '+58', label: '🇻🇪 +58 (VE)' },
    { value: '+593', label: '🇪🇨 +593 (EC)' },
    { value: '+55', label: '🇧🇷 +55 (BR)' },
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const splitStoredPhone = (storedPhone?: string) => {
    if (!storedPhone) return { countryCode: '+506', localPhone: '' };
    const trimmed = storedPhone.trim();
    const matchedCode = [...COUNTRY_CODE_OPTIONS]
        .sort((a, b) => b.value.length - a.value.length)
        .find(opt => trimmed.startsWith(opt.value));

    if (matchedCode) {
        return {
            countryCode: matchedCode.value,
            localPhone: trimmed.slice(matchedCode.value.length).trim(),
        };
    }

    return { countryCode: '+506', localPhone: trimmed };
};

interface IEditAccountSectionProps {
    sessionUser: ILocalSessionData['user'] | null;
    onUserUpdated: (updatedUser: ILocalSessionData['user']) => void;
    i18n: AccountPageI18n;
}

const EditAccountSection = ({ sessionUser, onUserUpdated, i18n }: IEditAccountSectionProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [nameInput, setNameInput] = useState('');
    const [lastnameInput, setLastnameInput] = useState('');
    const [usernameInput, setUsernameInput] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [countryCode, setCountryCode] = useState('+506');
    const [phoneInput, setPhoneInput] = useState('');

    const [debouncedUsername] = useDebouncedValue(usernameInput.trim(), 400);
    const [debouncedEmail] = useDebouncedValue(emailInput.trim(), 400);

    const [checkingUsername, setCheckingUsername] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
    const [checkingEmail, setCheckingEmail] = useState(false);
    const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);

    const syncFormWithUser = (user: ILocalSessionData['user'] | null) => {
        setNameInput(user?.name ?? '');
        setLastnameInput(user?.lastname ?? '');
        setUsernameInput(user?.username ?? '');
        setEmailInput(user?.email ?? '');
        const parsedPhone = splitStoredPhone(user?.phone);
        setCountryCode(parsedPhone.countryCode);
        setPhoneInput(parsedPhone.localPhone);
        setUsernameAvailable(null);
        setEmailAvailable(null);
    };

    useEffect(() => {
        syncFormWithUser(sessionUser);
    }, [sessionUser]);

    useEffect(() => {
        if (!isEditing) return;
        const trimmed = debouncedUsername;
        if (!trimmed || trimmed.length < 3 || trimmed === (sessionUser?.username ?? '')) {
            setUsernameAvailable(null);
            setCheckingUsername(false);
            return;
        }

        let cancelled = false;
        const verifyUsername = async () => {
            setCheckingUsername(true);
            const res = await checkUserAvailabilityAction({ username: trimmed });
            if (cancelled) return;
            setCheckingUsername(false);
            if (res.success && res.data) {
                setUsernameAvailable(res.data.usernameAvailable);
            }
        };

        verifyUsername();
        return () => {
            cancelled = true;
        };
    }, [debouncedUsername, isEditing, sessionUser?.username]);

    useEffect(() => {
        if (!isEditing) return;
        const trimmed = debouncedEmail;
        if (!trimmed || !EMAIL_REGEX.test(trimmed) || trimmed === (sessionUser?.email ?? '')) {
            setEmailAvailable(null);
            setCheckingEmail(false);
            return;
        }

        let cancelled = false;
        const verifyEmail = async () => {
            setCheckingEmail(true);
            const res = await checkUserAvailabilityAction({ email: trimmed });
            if (cancelled) return;
            setCheckingEmail(false);
            if (res.success && res.data) {
                setEmailAvailable(res.data.emailAvailable);
            }
        };

        verifyEmail();
        return () => {
            cancelled = true;
        };
    }, [debouncedEmail, isEditing, sessionUser?.email]);

    const email = sessionUser?.email || i18n.common.notAvailable;
    const phone = sessionUser?.phone || i18n.common.notAvailable;
    const isUsernameValid = usernameInput.trim().length >= 3;
    const isEmailValid = EMAIL_REGEX.test(emailInput.trim());
    const canSave =
        !isSaving &&
        !checkingUsername &&
        !checkingEmail &&
        isUsernameValid &&
        isEmailValid &&
        usernameAvailable !== false &&
        emailAvailable !== false;

    const handleCancelEdit = () => {
        syncFormWithUser(sessionUser);
        setIsEditing(false);
    };

    const handleSaveAccount = async () => {
        if (!canSave) return;
        setIsSaving(true);

        const cleanPhone = phoneInput.replace(/[^\d\s-]/g, '').trim();
        const composedPhone = cleanPhone ? `${countryCode} ${cleanPhone}` : '';

        const res = await updateUserAccountAction({
            name: nameInput.trim(),
            lastname: lastnameInput.trim(),
            username: usernameInput.trim(),
            email: emailInput.trim(),
            phone: composedPhone,
        });

        setIsSaving(false);

        if (res.success && res.user) {
            onUserUpdated(res.user);
            syncFormWithUser(res.user);
            setIsEditing(false);
            NotificationService.showMessage(
                i18n.sections.editAccount.messages.updateSuccess,
                NotificationTypes.ok,
                i18n.sections.editAccount.title,
            );
        } else {
            NotificationService.showMessage(
                i18n.sections.editAccount.messages.updateError,
                NotificationTypes.error,
                i18n.sections.editAccount.title,
            );
        }
    };

    return (
        <article className='panelCard'>
            <div className='panelHeader'>
                <div className='panelHeaderTitleGroup'>
                    <IconUser size={20} />
                    <div>
                        <h2>{i18n.sections.editAccount.title}</h2>
                        <p>{i18n.sections.editAccount.subtitle}</p>
                    </div>
                </div>
                {!isEditing && (
                    <Button
                        type='button'
                        radius='xl'
                        variant='gradient'
                        leftSection={<IconPencil size={16} />}
                        gradient={{ from: 'blue', to: 'cyan', deg: 161 }}
                        onClick={() => setIsEditing(true)}>
                        {i18n.sections.editAccount.actions.edit}
                    </Button>
                )}
            </div>

            {!isEditing ? (
                <div className='fieldGrid'>
                    <label className='fieldItem'>
                        <span>{i18n.sections.editAccount.fields.name}</span>
                        <div className='fieldValue'>
                            {sessionUser?.name || i18n.common.notAvailable}
                        </div>
                    </label>
                    <label className='fieldItem'>
                        <span>{i18n.sections.editAccount.fields.lastname}</span>
                        <div className='fieldValue'>
                            {sessionUser?.lastname || i18n.common.notAvailable}
                        </div>
                    </label>
                    <label className='fieldItem'>
                        <span>{i18n.sections.editAccount.fields.username}</span>
                        <div className='fieldValue'>
                            {sessionUser?.username || i18n.common.notAvailable}
                        </div>
                    </label>
                    <label className='fieldItem'>
                        <span>{i18n.sections.editAccount.fields.email}</span>
                        <div className='fieldValue'>{email}</div>
                    </label>
                    <label className='fieldItem'>
                        <span>{i18n.sections.editAccount.fields.phone}</span>
                        <div className='fieldValue'>{phone}</div>
                    </label>
                </div>
            ) : (
                <>
                    <div className='fieldGrid'>
                        <div className='fieldItem'>
                            <span>{i18n.sections.editAccount.fields.name}</span>
                            <TextInput
                                className='accountInput'
                                value={nameInput}
                                onChange={e => setNameInput(e.currentTarget.value)}
                                placeholder={i18n.sections.editAccount.placeholders.name}
                            />
                        </div>
                        <div className='fieldItem'>
                            <span>{i18n.sections.editAccount.fields.lastname}</span>
                            <TextInput
                                className='accountInput'
                                value={lastnameInput}
                                onChange={e => setLastnameInput(e.currentTarget.value)}
                                placeholder={i18n.sections.editAccount.placeholders.lastname}
                            />
                        </div>
                        <div className='fieldItem'>
                            <span>{i18n.sections.editAccount.fields.username}</span>
                            <TextInput
                                className='accountInput'
                                value={usernameInput}
                                onChange={e => setUsernameInput(e.currentTarget.value)}
                                placeholder={i18n.sections.editAccount.placeholders.username}
                                rightSection={
                                    checkingUsername ? (
                                        <Loader size='xs' />
                                    ) : usernameAvailable === true ? (
                                        <IconCheck size={16} color='#4ade80' />
                                    ) : usernameAvailable === false ? (
                                        <IconX size={16} color='#f87171' />
                                    ) : null
                                }
                            />
                            {!isUsernameValid && (
                                <small className='fieldStatusHint fieldStatusError'>
                                    {i18n.sections.editAccount.messages.invalidUsername}
                                </small>
                            )}
                            {isUsernameValid && usernameAvailable === true && (
                                <small className='fieldStatusHint fieldStatusOk'>
                                    {i18n.sections.editAccount.messages.usernameAvailable}
                                </small>
                            )}
                            {isUsernameValid && usernameAvailable === false && (
                                <small className='fieldStatusHint fieldStatusError'>
                                    {i18n.sections.editAccount.messages.usernameTaken}
                                </small>
                            )}
                        </div>
                        <div className='fieldItem'>
                            <span>{i18n.sections.editAccount.fields.email}</span>
                            <TextInput
                                className='accountInput'
                                type='email'
                                value={emailInput}
                                onChange={e => setEmailInput(e.currentTarget.value)}
                                placeholder={i18n.sections.editAccount.placeholders.email}
                                rightSection={
                                    checkingEmail ? (
                                        <Loader size='xs' />
                                    ) : emailAvailable === true ? (
                                        <IconCheck size={16} color='#4ade80' />
                                    ) : emailAvailable === false ? (
                                        <IconX size={16} color='#f87171' />
                                    ) : null
                                }
                            />
                            {!isEmailValid && (
                                <small className='fieldStatusHint fieldStatusError'>
                                    {i18n.sections.editAccount.messages.invalidEmail}
                                </small>
                            )}
                            {isEmailValid && emailAvailable === true && (
                                <small className='fieldStatusHint fieldStatusOk'>
                                    {i18n.sections.editAccount.messages.emailAvailable}
                                </small>
                            )}
                            {isEmailValid && emailAvailable === false && (
                                <small className='fieldStatusHint fieldStatusError'>
                                    {i18n.sections.editAccount.messages.emailTaken}
                                </small>
                            )}
                        </div>
                        <div className='fieldItem'>
                            <span>{i18n.sections.editAccount.fields.phone}</span>
                            <div className='phoneInputRow'>
                                <Select
                                    className='accountInput'
                                    aria-label={i18n.sections.editAccount.fields.countryCode}
                                    data={COUNTRY_CODE_OPTIONS}
                                    value={countryCode}
                                    onChange={val => setCountryCode(val || '+506')}
                                    searchable
                                    allowDeselect={false}
                                />
                                <TextInput
                                    className='accountInput'
                                    type='tel'
                                    value={phoneInput}
                                    onChange={e => setPhoneInput(e.currentTarget.value)}
                                    placeholder={i18n.sections.editAccount.placeholders.phone}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='editAccountActions'>
                        <Button
                            type='button'
                            radius='xl'
                            variant='subtle'
                            color='gray'
                            leftSection={<IconX size={16} />}
                            disabled={isSaving}
                            onClick={handleCancelEdit}>
                            {i18n.sections.editAccount.actions.cancel}
                        </Button>
                        <Button
                            type='button'
                            radius='xl'
                            variant='gradient'
                            loading={isSaving}
                            disabled={!canSave}
                            leftSection={<IconDeviceFloppy size={16} />}
                            gradient={{ from: 'blue', to: 'cyan', deg: 161 }}
                            onClick={handleSaveAccount}>
                            {i18n.sections.editAccount.actions.save}
                        </Button>
                    </div>
                </>
            )}
        </article>
    );
};

export default EditAccountSection;
