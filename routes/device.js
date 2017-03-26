module.exports = function(io) {
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

    io.on('connection', function(socket) {
        console.log("a user connected");

        socket.on("data_request", function(data) {
            client.hgetallAsync("sensor:" + data.sid + ":" + data.mid).then((object) => {
                socket.emit('data_response', object);
            }).catch((e) => {
                console.log("error")
                console.log(e)
            });
        });

        socket.on("disconnect", function() {
            console.log("user disconnected");
        });
        
    });

    /* GET devices listing. */
    router.get('/:device_id/:measurement_id', function(req, res, next) {
        client.smembersAsync("sensors").then((data) => {
            if (data.indexOf(req.params.device_id) != -1) {
                res.render('device', {
                    title: 'Devices',
                    device_id: req.params.device_id,
                    measurement_id: req.params.measurement_id
                });
            } else {
                next("route");
            }
        })
    });

    return router;
};

