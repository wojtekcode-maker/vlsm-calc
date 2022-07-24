import express, {static as expressStatic} from "express";
import {engine} from "express-handlebars";
import cookieParser from "cookie-parser";
import {vlsm} from "./routers/vlsm-calc";
import {handleError} from "./utils/error";

const app = express();

//Configure app
app.use(express.urlencoded({
    extended: true
}))
app.use(cookieParser());
app.use(handleError);
app.use(expressStatic('public'));
app.engine('.hbs', engine({
    defaultLayout: 'main',
    extname: '.hbs',
}));
app.set('view engine', '.hbs');


//Routers
app.use('/', vlsm);


app.listen(3000, 'localhost', () => {
    console.log('Server running on http://localhost:3000');
})