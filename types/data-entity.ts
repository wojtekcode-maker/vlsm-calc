export interface CookieEntity {
    id: string;
    url: '/step1' | '/step2' | string;
    networkAddress: string;
    subnetsAmount: number;
    subnets?: Array<Subnets>
}

export interface Subnets {
    hostName: string;
    hostAmount: number;
}