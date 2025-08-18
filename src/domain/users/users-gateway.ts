import { IBasicWebResponse } from '@/types/web-types';
import { IActionResponse } from '../auth/auth-gateway';

export interface IUsersGateway {
    getUsers: (
        username: string,
        limit?: number,
        offset?: number
    ) => Promise<IActionResponse<IUserListResponseDTO>>;
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
    prof_pic: string;
    isactive: boolean;
    creation_date: Date;
}
