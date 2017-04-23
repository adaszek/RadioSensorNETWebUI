var socket;

function ask_for_data(socket, sensor_id, measurement_id, from, to) {
    socket.emit('data_request', {
        "sid": sensor_id,
        "mid": measurement_id,
        "from": from,
        "to": to
    });
}

function data_req() {
}

$(document).ready(function () {
    socket = io();

    var g3 = new Dygraph(document.getElementById("graphdiv3"), [], {
        legend: "follow",
        fillGraph: true,
        rollPeriod: 5,
        showRoller: true,
        showRangeSelector: true,
        labels: ['Time', 'Measurement']
    })

    socket.on('data_response', function(data) {
        var graph_data = data[0].map((n, index) => [new Date(parseInt(n) * 1000), parseFloat(data[1][index])]);
        console.log(graph_data)
        g3.updateOptions({
            'file': graph_data,
        });
    });

});
