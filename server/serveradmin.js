var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var FB = require("./Firebase.js");

var room = io.of('/admin');

/********
Admin Methods
*********/
function setup() {
    room.on('connection', function(socket) {
        console.log('Admin has connected');

        // send information back to admin

        // Setup recievers
        socket.on('disconnect', function(socket) {
            console.log('Admin has disconnected');
        });

        socket.on('request patient list', sendPatientListToAdmin);
        socket.on('request moniter list', sendMoniterListToAdmin);
        socket.on('add patient', addPatient);
        socket.on('add moniter', addMoniter);

    });
}

function sendPatientListToAdmin() {
    //room.emit('patient list', patientList);
}

function sendMoniterListToAdmin() {
    //room.emit('moniter list', monitorList);
}

function addPatient(message) {

    //patientList[message.pid] = message.data;

    // Update disk copy
    //fs.writeFile('patient.json', JSON.stringify(patientList));
}

function addMoniter(message) {

    //monitorList[message.mid] = message.data;

    // Update disk copy
    //fs.writeFile('monitor.json', JSON.stringify(monitorList));
}
