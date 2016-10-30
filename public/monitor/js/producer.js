var room = io('/producer');
var pid;
var low;
var high;

var timer
var connected = false;

console.log('Started');

function determinePatient() {
    low = 20;
    high = 200;
    pid = $('#pid').val();
    timer = window.setInterval(sendData, 10000);
    console.log('Submitting to patient ' + pid);
}

room.once('connect', function(socket) {
    console.log('Connected to server');
    connected = true;
});

room.on('disconnect', function(socket) {
    console.log('Disconnected from Server');
    connected = false;
});


function sendData() {
    if (connected) {
        var d = {
            pid: pid,
            data: Math.round(Math.random() * (high - low) + low)
        };
        console.log('data sent');
        room.emit('patient update', d);
    }
}