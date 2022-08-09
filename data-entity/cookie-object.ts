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
        if (!(/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}0\/([8-9]|1[0-9]|2[0-9]|3[0-2])$/.test(obj.networkAddress))) {
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
            const subnets: Array<Subnets> = [];
            const orderingData = (spliceStart: number = 0, spliceCount: number = 2): Array<string> | null => {
                const copyArray = [...obj.subnets];
                const [hostName, hostAmount] = ((copyArray.splice(spliceStart, spliceCount)));

                if (typeof hostName === 'string' && typeof Number(hostAmount) === 'number' && Number(hostAmount) > 0 && Number(hostAmount) < 255) {
                    subnets.push({
                        hostName: hostName,
                        hostAmount: Number(hostAmount),
                    })
                } else {
                    throw new ValidationError('The number of hosts is incorrect. Next time enter a number between 1-254.');
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

    //VLSM operations.
    //Comparing subnets objects for sorting them DESC
    _compare(a: Subnets, b: Subnets) {
        if (a.hostAmount > b.hostAmount) {
            return -1;
        }
        if (a.hostAmount < b.hostAmount) {
            return 1;
        }
        return 0;
    }

    _findSlash(hostAmount: number): number {
        for (let i = 2; i < 33; i++) {
            if (hostAmount <= 2 ** i - 2) {
                return 32 - i;
            }
        }
    }

    _findMask(slash: number): Array<number> {
        const newMask: Array<number> = [0, 0, 0, 0];
        switch (true) {
            case  (slash < 8):
                newMask[0] = 256 - 2 ** (32 - (slash + 24));
                break;
            case (slash < 16):
                newMask[0] = 255;
                newMask[1] = 256 - 2 ** (32 - (slash + 16));
                break;
            case (slash < 24):
                newMask[0] = 255;
                newMask[1] = 255;
                newMask[2] = 256 - 2 ** (32 - (slash + 8));
                break;
            case (slash < 33):
                newMask[0] = 255;
                newMask[1] = 255;
                newMask[2] = 255;
                newMask[3] = 256 - 2 ** (32 - slash);
                break;
            default:
                throw new ValidationError('Oops...');
        }
        return newMask;
    }

    _findAddress(ip: Array<number>, mask: Array<number>) {
        const newAddress = [];
        for (let i = 0; i < 4; i++) {
            newAddress[i] = ip[i] & mask[i];
        }
        return newAddress;
    }

    _findBroadcast(mask: Array<number>, address: Array<number>) {
        const wildcard: Array<number> = [];
        for (let i = 0; i < 4; i++) {
            wildcard[i] = 255 - mask[i];
        }

        const broadcast: Array<number> = [];
        for (let i = 0; i < 4; i++) {
            broadcast[i] = wildcard[i] | address[i];
        }

        return broadcast;
    }

    _findHosts(hostAmount: number): number {
        return 2 ** (32 - hostAmount) - 2;
    }

    _nextAddress(address: Array<number>): Array<number> {
        if (address[3] < 256) {
            address[3]++;
        } else if (address[2] < 256) {
            address[3] = 0;
            address[2]++;
        } else if (address[1] < 256) {
            address[3] = 0;
            address[2] = 0;
            address[1]++;
        } else {
            address[3] = 0;
            address[2] = 0;
            address[1] = 0;
            address[0]++;
        }
        return address;
    }


    calculation(subnets: Array<Subnets>, networkAddress: string) {
        const vlsm: Array<{}> = [];
        const inputAddress = this._findAddress((this.networkAddress.split('/')[0].split('.')).map(ip => Number(ip)), this._findMask(Number(networkAddress.split('/')[1])));
        const orderedSubnets = subnets.sort(this._compare);

        let tempAddress = inputAddress;

        for (const subnet of orderedSubnets) {
            const slash = this._findSlash(subnet.hostAmount);
            const mask = this._findMask(slash);
            const address = this._findAddress(tempAddress, mask);
            const hosts = this._findHosts(slash);
            const broadcast = this._findBroadcast(mask, address);
            tempAddress = broadcast;
            vlsm.push({
                ...subnet,
                slash: slash,
                mask: mask,
                address: address,
                broadcast: broadcast,
                hostsRange: hosts,
            });
            tempAddress = this._nextAddress(tempAddress);
        }
        return vlsm;
    }

}
