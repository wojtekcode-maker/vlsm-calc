import {Router} from "express";

export const vlsm = Router();


vlsm
    .get('/step1', (req, res) => {
        res.render('form/send-form');
    })
    .post('/step1', ((req, res) => {
        console.log(req.body);
        res.end();
    }))
    .get('*', ((req, res) => {
        res.redirect('/step1');
    }))
