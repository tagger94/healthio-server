var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var patientList = require('./patient.json');
var monitorList = require('./monitor.json');

var counter = 0;

var patientRooms = {};

var adminRoom = io.of('/admin');
var monitorRoom = io.of('/moniter');

app.get('/', function(req, res) {
    if (counter % 2 == 0) {
        res.sendFile(__dirname + '/producer.html');
    }
    else {
        res.sendFile(__dirname + '/consumer.html');
    }
    counter++;

});

app.get('/consumer', function(req, res) {
    res.sendFile(__dirname + '/consumer.html');
});

app.get('/producer', function(req, res) {
    res.sendFile(__dirname + '/producer.html');
});

app.get('/admin', function(req, res) {
    res.sendFile(__dirname + '/admin.html');
});

http.listen(process.env.PORT, function() {
    console.log('listening on ' + process.env.PORT);
});

//CODE
/********
Producer Methods
*********/
monitorRoom.on('connection', function(socket) {
    console.log('Connected made to monitor');
});

monitorRoom.on('patient update', recievePatientUpdate);

function recievePatientUpdate(update) {
    //Patient Data is recieved
    //console.log(update.mid + ': ' + update.data);

    var mid = update.mid;
    var mType = mid.slice(0, 2);
    var pid = monitorList[mid].pid;

    console.log("Update from " + mid + ' for ' + pid + ': ' + update.data);

    //Send to database for updating
    if (mType == 'hb') {
        patientList[pid].last_heart = update.data;

        //Check if alert is needed
        if (update.data > patientList[pid].crit_high_heart || update.data < patientList[pid].crit_low_heart) {
            sendAlert(pid, mType, update);
        }
    }
    else if (mType == 'gl') {
        patientList[pid].last_gluc = update.data;

        //Check if alert is needed
        if (update.data > patientList[pid].crit_gluc) {
            sendAlert(pid, mType, update);
        }
    }
    else if (mType == 'wb') {
        patientList[pid].last_oxyg = update.data;

        //Check if alert is needed
        if (update.data > patientList[pid].crit_oxyg) {
            sendAlert(pid, mType, update);
        }
    }
};

/********
Consumer Methods
*********/

function createNewPatientRoom(pid) {
    //Check if room is already open
    if (!patientRooms.hasOwnProperty(pid)) {
        //open room
        patientRooms[pid] = io.of('/' + pid);
        console.log('opening room: ' + pid);
    }
    
    patientRooms[pid].on('connection', function() {
        console.log("Connected to patient room");
    })
    
    patientRooms[pid].on('disconnect', function() {
        console.log("disconnected to patient room");
    })
}

function sendAlert(pid, type, update) {
    //Prepare to send Alert
    createNewPatientRoom(pid);

    var message = "ALERT: " + pid + " has a critical status for " + type;
    console.log(message);

    //Send to socket
    patientRooms[pid].emit('alert', message);
}

/********
Admin Methods
*********/

adminRoom.on('connection', function(socket) {
    console.log('Admin has connected');

    // send information back to admin

});

adminRoom.on('disconnect', function(socket) {
    console.log('Admin has disconnected');
});

adminRoom.on('request patient list', sendPatientListToAdmin);
adminRoom.on('request moniter list', sendMoniterListToAdmin);

function sendPatientListToAdmin() {
    adminRoom.emit('patient list', patientList);
}

function sendMoniterListToAdmin() {

}



/*
    createPatient
    updatePatient
    deletePatient
    AttachMonitor
    
    updatePatient
    
    recieve patient update
    
    sendAlert
    sendStatus
*/