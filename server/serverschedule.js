var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var FB = require("./Firebase.js");

var room = io.of('/schedule');

/********
Schedule Methods
*********/
room.on('connection', function(socket) {
    console.log('Connected to schedule');

    socket.on('request schedule', function() {
        console.log('send data to schedule');
        room.emit('recieve schedule data', []);
    });

    socket.on('update schedule', function(date) {
        console.log(date);

    })
});