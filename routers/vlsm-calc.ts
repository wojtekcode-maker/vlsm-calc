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
        const {currentCalculation} = req.cookies as {
            currentCalculation: string;
        }
        const receivedCookie: CookieObject | [] = currentCalculation ? new CookieObject(JSON.parse(currentCalculation)) : null;

        const newCookie = new CookieObject({
            id: receivedCookie.id,
            url: req.originalUrl,
            networkAddress: receivedCookie.networkAddress,
            subnetsAmount: receivedCookie.subnetsAmount,
            subnets: receivedBodyArray,
        });

        res
            .cookie('currentCalculation', JSON.stringify(newCookie))
            .send('It works.')
    }))
    .get('*', ((req, res) => {
        res.redirect('/step1');
    }))
