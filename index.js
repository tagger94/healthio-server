var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var patientList = require('./patient.json');
var monitorList = require('./monitor.json');
var fs = require('fs');

var FB = require("./Firebase.js");

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
    console.log('Connection made to producer');

    // Setup recievers
    socket.on('disconnect', function(socket) {
        console.log('Disconnected from producer');
    });

    socket.on('patient update', recievePatientUpdate);
});

function recievePatientUpdate(update) {
    //Patient Data is recieved
    console.log("Producer delivered: " + update.mid + ' - ' + update.data);

    //Grab MID
    //Get PID from MID
    var event = new Event(update.mid, update.data);

    //console.log(event);

    //Use for later verison

    FB.retrieveUserData(event.pid, "Last_Sensor_Value", function(snapshot) {
        event.handlePatient(snapshot)
    });
    
    
    // event.handlePatient();

    //Send to database for updating
    // event.handleUpdate();

}

function Event(mid, data) {
    console.log('---Event Made!!!!');
    this.mid = mid;
    this.pid = "123456789";
    this.patient = null;
    this.data = data;
    this.handlePatient = function(snapshot) {
        if (snapshot) {
            this.patient = snapshot.val();
            console.log("Last Data Point: " + this.patient);
        }

        //Send to database for updating
        FB.updatePatientInfo(this.pid, "Last_Sensor_Value", this.data);
        sendUpdate(this.pid, "heart", this.data);
    };



};

// Event.prototype.handlePatient = function(snapshot) {
//         this.patient = snapshot.val();
//         console.log(this);

//         //Send to database for updating
//         FB.updatePatientInfo(this.pid, "Last_Sensor_Value", this.data);
//     };

/********
Consumer Methods
*********/

function createNewPatientRoom(pid) {
    console.log("Attempt to setup patient room");

    //Check if room is already open
    if (!patientRooms.hasOwnProperty(pid)) {
        //open room
        patientRooms[pid] = io.of('/' + pid);
        console.log('opening room: ' + pid);

        //Setup listeners
        patientRooms[pid].on('connection', function(socket) {
            console.log('Connection made to consumer');

            socket.on('get patient data', requestForPatientData);

            socket.on('disconnect', function() {
                console.log("disconnected from consumer room");
            })
        })
    }
}

function requestForPatientData(pid) {

    //Setup Object for binding
    var obj = {
        pid: pid,
        sendToConsumer: function(patient) {
            console.log("Sending patient data to consumer");
            patientRooms[this.pid].emit("send patient data");
        }
    };


    //Call DB and set callback method
    FB.retrieveUserData(pid, "", obj.sendToConsumer);
}

function sendPatientDataToConsumer(pid) {
    // patientRooms[pid].emit('patient data', patientList[pid]);
    return (patientList[pid]);
    //spoof.emit(patientRooms[pid])

}

function sendUpdate(pid, type, update) {
    console.log('Sending update data to consumer');

    //Prepare to send update
    createNewPatientRoom(pid);

    //Create message to send
    var message = {
        pid: pid,
        type: type,
        update: update
    };

    //Send to consumer
    patientRooms[pid].emit('alert', message); //TODO change to message later
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
        for (var prop in monitorList) {
            mArr.push(prop);
        }
        spoofRoom.emit('spoof monitors', mArr);
    })

    socket.on('get patients', function(msg) {
        //var mArr = monitorList.keys();
        var mArr = [];
        for (var prop in patientList) {
            mArr.push(prop);
        }
        spoofRoom.emit('spoof patients', mArr);
    })
    socket.on('get patient data', function(msg) {
        spoofRoom.emit('patient data', sendPatientDataToConsumer(msg));
    });


});
