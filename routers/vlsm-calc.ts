import {Router} from "express";
import {CookieObject} from "../data-entity/cookie-object";
import {Subnets} from "../types/data-entity";
import {ValidationError} from "../utils/error";

export const vlsm = Router();


vlsm
    .get('/step1', (req, res) => {
        res.render('form/send-form');
    })
    .post('/step1', ((req, res) => {
        try {
            const newCookie = new CookieObject({
                url: req.originalUrl,
                ...req.body,
            });
            res
                .cookie('currentCalculation', JSON.stringify(newCookie))
                .redirect('/step2');
        } catch (error) {
            res.render('error', {
                description: error,
            })
        }
    }))
    .get('/step2', ((req, res) => {
        const {currentCalculation} = req.cookies as {
            currentCalculation: string;
        }
        const receivedCookie: CookieObject | [] = currentCalculation ? new CookieObject(JSON.parse(currentCalculation)) : [];

        if (receivedCookie instanceof CookieObject) {
            res.render('form/send-form', {
                url: receivedCookie.url,
                subnetsAmount: receivedCookie.subnetsAmount,
            });
        } else {
            res.clearCookie('currentCalculation')
                .redirect('/step1');
        }
    }))
    .post('/summary', ((req, res) => {
        const receivedBodyArray = Object.keys(req.body)
            .map((key) => {
                return req.body[key];
            });
        const subnets: Array<Subnets> = []
        const orderingData = (spliceStart: number = 0, spliceCount: number = 2): Array<string> | null => {
            const copyArray = [...receivedBodyArray];
            const [hostName, hostAmount] = ((copyArray.splice(spliceStart, spliceCount) as Array<string>));

            if (typeof hostName === 'string' && typeof Number(hostAmount) === 'number' && Number(hostAmount) > 0 && Number(hostAmount) < 255) {
                subnets.push({
                    hostName: hostName,
                    hostAmount: Number(hostAmount),
                })
            } else {
                throw new ValidationError('The number of hosts entered is incorrect. Enter a number between 1-254.');
            }

            if (spliceStart < (receivedBodyArray.length - 2)) {
                orderingData(spliceStart + 2)
            } else {
                return null;
            }
        }
        orderingData();

        const {currentCalculation} = req.cookies as {
            currentCalculation: string;
        }

        const receivedCookie: CookieObject | [] = currentCalculation ? new CookieObject(JSON.parse(currentCalculation)) : null;

        const newCookie = new CookieObject({
            id: receivedCookie.id,
            url: req.originalUrl,
            networkAddress: receivedCookie.networkAddress,
            subnetsAmount: receivedCookie.subnetsAmount,
            subnets: subnets,
        });


        res
            .cookie('currentCalculation', JSON.stringify(newCookie))
            .send('It works.')
    }))
    .get('*', ((req, res) => {
        res.redirect('/step1');
    }))
