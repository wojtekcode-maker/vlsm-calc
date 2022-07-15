import {Router} from "express";

export const vlsm = Router();


vlsm
    .get('/', (req, res) => {
        res.render('form/send-form');
    });