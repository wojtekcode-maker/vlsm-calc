import {Router} from "express";
import {CookieObject} from "../data-entity/cookie-object";
import {Subnets} from "../types/data-entity";

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

            subnets.push({
                hostName: hostName,
                hostAmount: Number(hostAmount),
            })

            if (spliceStart < (receivedBodyArray.length - 2)) {
                orderingData(spliceStart + 2)
            } else {
                return null;
            }
        }
        orderingData();

        res.send('ok');
    }))
    .get('*', ((req, res) => {
        res.redirect('/step1');
    }))
