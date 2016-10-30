//var app = require('express')();
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

// var FB = require("./server/Firebase.js");
// var SA = require("./server/serveradmin.js");
// var SC = require("./server/serverconsumer.js");
var SP = require("./server/serverproducer.js");


/********
Default Methods
*********/

app.use(express.static(path.join(__dirname, 'public')));

//Depreciated
function setupRouting() {
    //Home page 
    app.get('/', function(req, res) {
        res.sendFile(__dirname + '/client/home.html');
    });

    //Log in screen
    app.get('/client/views/login', function(req, res) {
        res.sendFile(__dirname + '/client/views/login.html');
    });

    //Add/Remove/View patient 
    app.get('/client/views/patient', function(req, res) {
        res.sendFile(__dirname + '/client/views/patient.html');
    });

    //Add/Remove/View billing
    app.get('/client/views/billing', function(req, res) {
        res.sendFile(__dirname + '/client/views/billing.html');
    });

    app.get('/consumer', function(req, res) {
        res.sendFile(__dirname + '/monitor/consumer.html');
    });

    app.get('/producer', function(req, res) {
        res.sendFile(__dirname + '/monitor/producer.html');
    });
    app.use(express.static(path.join(__dirname, 'public')));

}

/********
Default Methods
*********/
http.listen(process.env.PORT, function() {
    console.log('listening on ' + process.env.PORT);
});

SP.setup(io);