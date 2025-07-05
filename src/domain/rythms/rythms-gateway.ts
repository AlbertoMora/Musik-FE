import { IRythmModel } from '@/infrastructure/models/RythmModel';

export interface IRythmsGateway {
    getRythms: (name: string) => Promise<IRythmModel[] | null>;
}
