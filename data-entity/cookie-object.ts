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
        (obj.url === '/summary') {
            const subnets: Array<Subnets> = []
            const orderingData = (spliceStart: number = 0, spliceCount: number = 2): Array<string> | null => {
                const copyArray = [...obj.subnets];
                const [hostName, hostAmount] = ((copyArray.splice(spliceStart, spliceCount)));

                if (typeof hostName === 'string' && typeof Number(hostAmount) === 'number' && Number(hostAmount) > 0 && Number(hostAmount) < 255) {
                    subnets.push({
                        hostName: hostName,
                        hostAmount: Number(hostAmount),
                    })
                } else {
                    throw new ValidationError('The number of hosts entered is incorrect. Enter a number between 1-254.');
                }

                if (spliceStart < (obj.subnets.length - 2)) {
                    orderingData(spliceStart + 2)
                } else {
                    return null;
                }
            }
            orderingData();
            this.id = uuid();
            this.url = obj.url;
            this.networkAddress = obj.networkAddress;
            this.subnetsAmount = obj.subnetsAmount;
            this.subnets = subnets;
        } else {
            throw new ValidationError('The url is invalid.')
        }
    }
}
