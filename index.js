//var app = require('express')();
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

// var FB = require("./server/Firebase.js");
var SA = require("./server/serveradmin.js");
// var SC = require("./server/serverconsumer.js");
var SP = require("./server/serverproducer.js");


/********
Default Methods
*********/

app.use(express.static(path.join(__dirname, 'public')));

/********
Default Methods
*********/
http.listen(process.env.PORT, function() {
    console.log('listening on ' + process.env.PORT);
});

SP.setup(io);
SA.setup(io);