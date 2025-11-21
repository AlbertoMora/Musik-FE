'use client';
import React, { useEffect } from 'react';
import { I18nTypes } from '../../../../i18n/dictionaries';
import { IBasicWebResponse, responseCodes } from '@/types/web-types';
import {
    NotificationService,
    NotificationTypes,
} from '@/presentation/services/notification-service';
import { getResponseData, webRequest } from '@/utils/web-utils';

interface ICallbackManagerProps {
    code: string;
    i18n: I18nTypes['app']['navbar']['auth']['login']['oauth'];
}

const CallbackManager = ({ i18n, code }: ICallbackManagerProps) => {
    useEffect(() => {
        const handleCallbackEvent = async () => {
            const res = await webRequest('/api/google/callback').post({ code });
            const json = await getResponseData<IBasicWebResponse>(res, 'client');

            if (json?.data?.status !== responseCodes.ok) {
                window.close();
                return NotificationService.showMessage(
                    i18n.sessionErr,
                    NotificationTypes.error,
                    'Error',
                    'top-center'
                );
            }

            window.opener.location.reload();
            window.close();
        };
        handleCallbackEvent();
    }, [code, i18n.sessionErr]);

    return <div>{i18n.validating}</div>;
};

export default CallbackManager;
