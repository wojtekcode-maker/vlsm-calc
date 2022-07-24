import {Router} from "express";
import {CookieObject} from "../data-entity/cookie-object";

export const vlsm = Router();


vlsm
    .get('/step1', (req, res) => {
        res.render('form/send-form');
    })
    .post('/step1', ((req, res) => {
        const newCookie = new CookieObject({
            url: req.originalUrl,
            ...req.body,
        });
        res
            .cookie('currentCalculation', JSON.stringify(newCookie))
            .redirect('/step2');
    }))
    .get('/step2', ((req, res) => {
        const {currentCalculation} = req.cookies as {
            currentCalculation: string;
        }
        const receivedCookie: CookieObject | [] = currentCalculation ? new CookieObject(JSON.parse(currentCalculation)) : [];
        console.log(receivedCookie);

        if (receivedCookie instanceof CookieObject) {
            res.render('form/send-form', {
                url: receivedCookie.url,
                subnetsAmount: receivedCookie.subnetsAmount,
                //@TODO Display table with inputs subnetsAmount Times
            });
        } else {
            res.clearCookie('currentCalculation')
                .redirect('/step1');
        }

    }))
    .get('*', ((req, res) => {
        res.redirect('/step1');
    }))
