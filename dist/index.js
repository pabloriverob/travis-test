"use strict";
exports.__esModule = true;
var metrics_1 = require("./metrics");
var express = require("express");
var app = express();
app.set('port', 1337);
app.set('views', __dirname + "/view");
app.set('view engine', 'ejs');
app.listen(app.get('port'), function () { return console.log("server listening on " + app.get('port')); });
app.get('/hello/Team9', function (req, res) { return res.render('intro.ejs'); });
app.get('/hello/:name', function (req, res) { return res.render('hello.ejs', { name: req.params.name }); });
app.get('/', function (req, res) { return res.render('use.ejs'); });
app.use(function (err, req, res, next) {
    res.status(404).send('Wrong path');
});
app.get('/metrics.json', function (req, res) {
    metrics_1.metrics.get(function (err, data) {
        if (err)
            throw err;
        res.status(200).json(data);
    });
});
var path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
