// var app = require('express')();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);

var FB = require("./Firebase.js");
var SC = require("./serverconsumer.js");

module.exports = {
    setup: setup
};

/********
Producer Methods
*********/
function setup(io) {
    if (!io) {
        console.log('CRITICAL ERROR IN PRODUCER: NO SERVER FOUND!');
        return;
    }
    console.log('Running setup for PRODUCER');

    var room = io.of('/producer');

    room.on('connect', function(socket) {
        console.log('Connection made to producer');

        // Setup recievers
        socket.on('disconnect', function(socket) {
            console.log('Disconnected from producer');
        });

        socket.on('patient update', recievePatientUpdate);
    });

    SC.setup(io);
}

function recievePatientUpdate(update) {
    //Patient Data is recieved
    console.log("Producer delivered: " + update.mid + ' - ' + update.data);

    //Create Event
    var event = new Event(update.pid, update.data);

    //Send Update to database
    FB.retrieveUserData(event.pid, "Last_Sensor_Value", function(snapshot) {
        event.handlePatient(snapshot);
    });
}

function Event(pid, data) {
    // console.log('---Event Made!!!!');
    this.pid = pid;
    this.patient = null;
    this.data = data;
    this.handlePatient = function(snapshot) {
        if (snapshot) {
            this.patient = snapshot.val();
            console.log("Last Data Point: " + this.patient);
            //Check if critical
            SC.sendUpdate(this.pid, this.data);
        }

        //Send to database for updating
        FB.updatePatientInfo(this.pid, "Last_Sensor_Value", this.data);
    };
};
