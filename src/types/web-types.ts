export interface IBasicWebResponse {
    status: string;
}

export const responseCodes = {
    ok: 'SUCCESS',
    clientError: 'REJECTED',
    serverError: 'ERROR',
};
