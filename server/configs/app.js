/**
 * Created by xgharibyan on 6/7/17.
 */

const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');


//Routes
const index = require('./../routes/index');


const app = express();



app.use(express.static(path.join(__dirname, '../', 'client')));
app.use('/build', express.static(path.join(__dirname, '../../', 'build')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api', index);

app.get("*", (req, res, next) => {
    //Won't log every single request on the logger to avoid cluttering. Console only.
    console.log(req.method + ' ' + req.headers.host + req.url);

    const isApiRoute = req.url.startsWith('/api/');

    if (isApiRoute) return next();
    res.sendFile(path.resolve(__dirname, "../../build", "index.html"));
});


module.exports = app;
