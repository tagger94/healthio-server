var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var patientList = require('./patient.json');
var monitorList = require('./monitor.json');
var fs = require('fs');

var patientRooms = {};

var adminRoom = io.of('/admin');
var monitorRoom = io.of('/monitor');

var spoofRoom = io.of('/spoof');
var scheduleRoom = io.of('/schedule');

//Home page 
//TODO add log in system and apply to all connnected pages with acces to data.
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
    res.sendFile(__dirname + '/consumer.html');
});

app.get('/producer', function(req, res) {
    res.sendFile(__dirname + '/producer.html');
});



app.get('/schedule', function(req, res) {
    res.sendFile(__dirname + '/schedule.html');
});

http.listen(process.env.PORT, function() {
    console.log('listening on ' + process.env.PORT);
});

//CODE
/********
Default Methods
*********/
io.on('connect', function(msg) {
    console.log('new client connected');
})

/********
Producer Methods
*********/
monitorRoom.on('connection', function(socket) {
    console.log('Connection made to monitor');


    // Setup recievers
    socket.on('disconnect', function(socket) {
        console.log('Disconnected from monitor');
    });

    socket.on('patient update', recievePatientUpdate);
});

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
        if (update.data > patientList[pid].crit_high_gluc || update.data < patientList[pid].crit_low_gluc) {
            sendAlert(pid, mType, update);
        }
    }
    else if (mType == 'wb') {
        patientList[pid].last_wbc = update.data;

        //Check if alert is needed
        if (update.data > patientList[pid].crit_high_wbc || update.data < patientList[pid].crit_low_wbc) {
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
        console.log("object: " + pid.stringify);
        patientRooms[pid] = io.of('/' + pid);
        console.log('opening room: ' + pid);
    }
    patientRooms[pid].on('get patient data', sendPatientDataToConsumer);

    patientRooms[pid].on('connect', function() {
        console.log("Connected to patient room");

        patientRooms[pid].on('disconnect', function() {
            console.log("disconnected from patient room");
        })
    
    })
}

function sendPatientDataToConsumer(pid) {
  // patientRooms[pid].emit('patient data', patientList[pid]);
   return(patientList[pid]);
  //spoof.emit(patientRooms[pid])
    
}

function sendAlert(pid, type, update) {
    //Prepare to send Alert
    createNewPatientRoom(pid);

    var message = "ALERT: " + pid + " has a critical status for " + type;
    console.log(message);
    
    if(type == "hb") {
        type = "irregular Heart measurement";
    } else if(type == "gl") {
        type = "irregular Glucose measurement";
    } else {
        type = "irregular White Blood Cell count";
    }
    var message = {
        pid: pid,
        type: type
    };

    //Send to socket
    patientRooms[pid].emit('alert', message);
}

/********
Admin Methods
*********/

adminRoom.on('connection', function(socket) {
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

function sendPatientListToAdmin() {
    adminRoom.emit('patient list', patientList);
}

function sendMoniterListToAdmin() {
    adminRoom.emit('moniter list', monitorList);
}

function addPatient(message) {

    patientList[message.pid] = message.data;
    
    // Update disk copy
    fs.writeFile('patient.json', JSON.stringify(patientList));
}

function addMoniter(message) {

    monitorList[message.mid] = message.data;
    
    // Update disk copy
    fs.writeFile('monitor.json', JSON.stringify(monitorList));
}

/********
Schedule Methods
*********/
scheduleRoom.on('connection', function(socket) {
    console.log('Connected to schedule');
    
    socket.on('request schedule', function() {
        console.log('send data to schedule');
        scheduleRoom.emit('recieve schedule data', []);
    });
    
    socket.on('update schedule', function(date) {
        console.log(date);
        
    })
});


/********
Spoof Methods

Methods for creating a usable example
*********/

spoofRoom.on('connect', function(socket) {
    console.log('Spoof connected');
    
    socket.on('get monitors', function(msg) {
        //var mArr = monitorList.keys();
        var mArr = [];
        for(var prop in monitorList) {
            mArr.push(prop);
        }
        spoofRoom.emit('spoof monitors', mArr);
    })
    
    socket.on('get patients', function(msg) {
        //var mArr = monitorList.keys();
        var mArr = [];
        for(var prop in patientList) {
            mArr.push(prop);
        }
        spoofRoom.emit('spoof patients', mArr);
    })
    socket.on('get patient data', function(msg) {
       spoofRoom.emit('patient data', sendPatientDataToConsumer(msg));
    });
    
    
});
