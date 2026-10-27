import { IBasicWebResponse } from '@/types/web-types';
import { IActionResponse, ISessionResponseDTO } from '../auth/auth-gateway';

export type DfaChannelType = 'email' | 'sms';

export interface IUsersGateway {
    getUsers: (
        username: string,
        limit?: number,
        offset?: number,
    ) => Promise<IActionResponse<IUserListResponseDTO>>;
    checkAvailability: (params: {
        username?: string;
        email?: string;
    }) => Promise<IActionResponse<ICheckAvailabilityResponseDTO>>;
    updateAccount: (
        payload: IUpdateAccountModel,
    ) => Promise<IActionResponse<ISessionResponseDTO>>;
    getSecuritySettings: () => Promise<IActionResponse<ISecuritySettingsResponseDTO>>;
    updateDfaSettings: (
        dfaChannel: DfaChannelType,
    ) => Promise<IActionResponse<IUpdateDfaResponseDTO>>;
    updatePassword: (
        payload: IUpdatePasswordModel,
    ) => Promise<IActionResponse<IUpdatePasswordResponseDTO>>;
}

export interface ISecuritySettingsResponseDTO extends IBasicWebResponse {
    hasPassword: boolean;
    hasPhone: boolean;
    dfaChannel: DfaChannelType;
    email: string;
    phone: string | null;
}

export interface IUpdateDfaResponseDTO extends IBasicWebResponse {
    dfaChannel: DfaChannelType;
}

export interface IUpdatePasswordModel {
    password: string;
    deviceId: string;
    rsaPubKey?: string;
    code?: string;
    shouldDeviceSafe?: boolean;
}

export interface IUpdatePasswordResponseDTO extends IBasicWebResponse {
    shouldVerifySession: boolean;
    hasPassword?: boolean;
    dfaChannel?: DfaChannelType;
    sendTo?: string;
}

export interface IUpdateAccountModel {
    name?: string;
    lastname?: string;
    email?: string;
    username?: string;
    phone?: string;
}

export interface ICheckAvailabilityResponseDTO extends IBasicWebResponse {
    usernameAvailable: boolean;
    emailAvailable: boolean;
}

export interface IUserListResponseDTO extends IBasicWebResponse {
    count: number;
    users: IUserResponseDTO[];
}

export interface IUserResponseDTO {
    id: string;
    name: string;
    lastname: string;
    email: string;
    username: string;
    phone?: string;
    prof_pic: string;
    isactive: boolean;
    creation_date: Date;
}
