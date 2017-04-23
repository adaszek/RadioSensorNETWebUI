var socket;
var graph_data = [];

function ask_for_data(socket, sensor_id, measurement_id, from, to) {
    if(from <= to) {
        socket.emit('data_request', {
            "sid": sensor_id,
            "mid": measurement_id,
            "from": from,
            "to": to
        });
    }
}

$(document).ready(function () {
    socket = io();
    $('#datetimepicker1').datetimepicker({
        locale: 'en-gb',
        format: 'YYYY/MM/DD HH:mm',
        showTodayButton: true,
        defaultDate: Date.now() - 60000 * 60 * 1,
        showClear: true
    });

    $('#datetimepicker2').datetimepicker({
        locale: 'en-gb',
        format: 'YYYY/MM/DD HH:mm',
        showTodayButton: true,
        useCurrent: true,
        defaultDate: Date.now(),
        showClear: true
    });

    var g3 = new Dygraph(document.getElementById("graphdiv3"), [], {
        legend: "follow",
        fillGraph: true,
        rollPeriod: 5,
        showRoller: true,
        showRangeSelector: false,
        labels: ['Time', 'Measurement']
    })

    socket.on('data_response', (data) => {
        graph_data = data[0].map((n, index) => [new Date(parseInt(n) * 1000), parseFloat(data[1][index])]);
        g3.updateOptions({
            'file': graph_data,
        });
    });
});
