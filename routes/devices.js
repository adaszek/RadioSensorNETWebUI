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
        client
            .multi()
            .smembers("sensors")
            .hgetall("sensors:functions")
            .hgetall("sensors:last_location")
            .execAsync()
            .then((data) => {
                for(var i in data[0]) {
                    console.log(data[0][i]);
                    if (data[1].hasOwnProperty(data[0][i])) {
                        console.log(data[1][data[0][i]]);
                    }
                    if (data[2].hasOwnProperty(data[0][i])) {
                        console.log(data[2][data[0][i]]);
                    }
                }
                res.send(data);
            });
    });

    return router;
};

