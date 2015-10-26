var nconf = require('nconf');
nconf.file({file: './config.json'});
var rsvp = require('rsvp');
var pgLib = require('pg-promise');
var express = require('express');
var querySequel = require('./../query-sequel'); //

var api = express();
api.use(querySequel);//transform our query params into sql
api.use(function(req,res,next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

var opts = nconf.get('db');
var pg = pgLib();

var db = pg("postgres://"+opts.user+":"+opts.password+"@"+opts.host+":"+opts.port+"/"+opts.database);

var qu = 'select * from schiedam.stortingen_2015_12 limit 1;';

function getData(req, res) {
    db.connect()
    .then(function(obj) {
        var sco = obj;
        return sco.query(req.processedQuery.text, req.processedQuery.values);
    },function(error) {
        console.log('connection error');
        console.log(error)
    })
    .then(function(data) {
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    },function(error){
        console.log(error);
        res.send('error');
    })
}

/**
* @api {get} /buurten Fetch all buurten with data by timerange
*/
api.get('/', getData);

api.listen(9080, function() {
    console.log('Listening on port 9080');
});
