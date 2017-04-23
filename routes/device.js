module.exports = function(io) {
    var redis = require("redis");
    var bluebird = require("bluebird");
    var express = require('express');
    var moment = require("moment")
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
            client.zrangebylexAsync("sensor:" + data.sid + ":" + data.mid + ":timestamps", "(" + moment(data.from).unix(), "(" + moment(data.to).unix())
                .then((timestamps) => {
                    client.hmgetAsync("sensor:" + data.sid + ":" + data.mid, timestamps)
                        .then((object) => {
                            socket.emit('data_response', [timestamps, object]);
                        })
                        .catch((e) => {
                            console.log("error")
                            console.log(e)
                        });
                });
        });

        socket.on("disconnect", function() {
            console.log("user disconnected");
        });
        
    });

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

