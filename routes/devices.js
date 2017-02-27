module.exports = () => {
    var redis = require("redis");
    var bluebird = require("bluebird");
    var express = require('express');
    var router = express.Router();

    bluebird.promisifyAll(redis.RedisClient.prototype);
    bluebird.promisifyAll(redis.Multi.prototype);

    var client = redis.createClient(6379, "192.168.1.158")

    client.onAsync("connect", () => {
        console.log("connected")
    })

    /* GET devices listing. */
    router.get('/', function(req, res, next) {
        res.render('devices', { title: 'Devices' });
    });

    router.get('/api', function(req, res, next) {
        //TODO: WATCH for reading
        //TODO: chain of promises
        var p1 = client.smembersAsync("sensors").then((data) => {
            return data;
        });
        var p2 = client.hgetallAsync("sensors:functions").then((data) => {
            return data;
        });
        
        Promise.all([p1, p2]).then((results) => {
            res.send(results);
        });
    });

    return router;
};

