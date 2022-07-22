import express, {static as expressStatic} from "express";
import {vlsm} from "./routers/vlsm-calc";
import {engine} from "express-handlebars";

const app = express();

//Configure app
app.use(expressStatic('public'));
app.engine('.hbs', engine({
    defaultLayout: 'main',
    extname: '.hbs',
}));
app.set('view engine', '.hbs');
app.use(express.urlencoded({
    extended: true
}))


//Routers
app.use('/', vlsm);


app.listen(3000, 'localhost', () => {
    console.log('Server running on http://localhost:3000');
})