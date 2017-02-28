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
                var return_array = [];
                for(var i in data[0]) {
                    var row = [];
                    row.push(data[0][i]);

                    if (data[1].hasOwnProperty(data[0][i])) {
                        row.push(data[1][data[0][i]]);
                    } else {
                        row.push("unknown");
                    }
                    if (data[2].hasOwnProperty(data[0][i])) {
                        row.push(data[2][data[0][i]]);
                    } else {
                        row.push("unknown");
                    }
                    return_array.push(row);
                }
                res.send({ data: return_array });
            });
    });

    return router;
};

