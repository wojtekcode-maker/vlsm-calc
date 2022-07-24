import {v4 as uuid} from 'uuid';
import {CookieEntity, Subnets} from "../types/data-entity";
import {ValidationError} from "../utils/error";

export class CookieObject {
    public id: string;
    public url: string;
    public networkAddress: string;
    public subnetsAmount: number;
    public subnets?: Array<Subnets>

    constructor(obj: CookieEntity) {
        if (!(/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}0\/(1[6-9]|2[0-9]|30)$/.test(obj.networkAddress))) {
            throw new ValidationError('Network address is incorrect!');
        }
        if (Number(obj.subnetsAmount) < 2 || Number(obj.subnetsAmount > 64)) {
            throw new ValidationError('Amount of subnets is invalid!');
        }

        if (obj.url === '/step1') {
            this.id = uuid();
            this.url = obj.url;
            this.networkAddress = obj.networkAddress;
            this.subnetsAmount = obj.subnetsAmount;
            this.subnets = [];
        } else if
        (obj.url === '/step2') {
            this.subnets = obj.subnets
        } else {
            throw new ValidationError('The url is invalid.')
        }
    }
}
