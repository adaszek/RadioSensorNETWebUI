var bluebird = require("bluebird");

function get_latest_activity(redis_client) {
    return redis_client
        .multi()
        .smembers("sensors")
        .hgetall("functions")
        .execAsync()
        .then(data => {
            return data;
            /*
            var funct = [];
            for (var i in data) {
                funct.push(data[i]);
            }
            var sid = "sensor:" + sensor_id + ":";

            return bluebird.map(funct, (func) => {
                return redis
                    .zrangeAsync(sid + func + ":timestamps", -1, -1);
            });
            */
        });
}

function get_init_data(redis_client) {
    return redis_client
        .multi()
        .smembers("sensors")
        .hgetall("sensors:functions")
        .hgetall("sensors:last_location")
        .hgetall("functions")
        .execAsync()
        .then((data) => {
            var return_array = [];
            for(var i in data[0]) {
                var row = [];
                row.push(data[0][i]);

                if (data[1].hasOwnProperty(data[0][i])) {
                    var to_parse = data[1][data[0][i]];
                    var temp_split = to_parse.split(";");
                    var temp_object = {};
                    for (var param in temp_split) {
                        var arg_and_value = temp_split[param].split(":");
                        if (arg_and_value[0] === "r" || arg_and_value[0] === "w") {
                            var properties = arg_and_value[1].split(",");
                            var result = [];
                            if(properties.length > 1) {
                                result = properties.map((x) => {
                                return data[3][x];
                                });
                            }
                            temp_object[arg_and_value[0]] = result;
                        } else {
                            temp_object[arg_and_value[0]] = arg_and_value[1];
                        }
                    }
                    row.push(temp_object);
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
            return return_array;
        })
        .catch(e => {
            console.log(e);
        });
}


module.exports = () => {
    var express = require('express');
    var router = express.Router();
    var redis = require("redis");

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
        get_init_data(client).then(init_data => {
            get_latest_activity(client).then(latest_activity => {
                console.log(latest_activity);
            });
            res.send({ data: init_data });
        });
    });

    return router;
};

