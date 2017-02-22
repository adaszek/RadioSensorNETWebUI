var express  = require("express");
var app = express();
var path = require("path");

var http = require("http").Server(app);
var io = require("socket.io")(http);
var redis = require("redis");
var bluebird = require("bluebird");

var fields = [ "Date", "measurement" ];

var morgan = require("morgan");

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

var client = redis.createClient(6379, "192.168.1.158")

client.onAsync("connect", () => {
    console.log("connected")
})

app.use("/dg", express.static(path.join(__dirname, "node_modules/dygraphs/dist")));
app.use(morgan("combined"));

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");

});

io.on('connection', function(socket) {
    console.log("a user connected");
    client.smembersAsync("sensors").then((object) => {
        var options = {};
        for(var sid in object) {
            options[object[sid]] = object[sid];
        }
        socket.emit("sensor_list", options);
    });

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

http.listen(3000, function() {
    console.log("listening on *:3000");
});
