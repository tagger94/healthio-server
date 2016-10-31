var FB = require("./Firebase.js");

var room;

/********
Admin Methods
*********/
function setup(io) {
    if (!io) {
        console.log('CRITICAL ERROR IN ADMIN: NO SERVER FOUND!');
        return;
    }
    console.log('Running setup for ADMIN');
    
    room = io.of('/admin');
    room.on('connect', function(socket) {
        console.log('Admin has connected');

        // send information back to admin
        sendPatientNamesToAdmin();

        // Setup recievers
        socket.on('disconnect', function(socket) {
            console.log('Admin has disconnected');
        });

        socket.on('request patient list', sendPatientListToAdmin);
        socket.on('add patient', addPatient);

    });
    
}

//Sends object with PID as key
function sendPatientListToAdmin() {
    FB.getAllPatientInfo(function (snapshot) {
        if(snapshot) {
            room.emit('patient list', snapshot.val());
        }
    });
}

//Sends an Array of PID and Name to admin
function sendPatientNamesToAdmin() {
    FB.getAllPatientInfo(function (snapshot) {
        if(snapshot) {
            var list = snapshot.val();
            
            var arr = [];
            for(var pid in list) {
                var obj = {
                    pid: pid,
                    name: list[pid].Name
                };
                arr.push(obj);
            }
            
            console.log(arr);
            
            room.emit('patient names', arr);
        }
    });
}

function addPatient(m) {
    
    FB.createPatient(m.pid, m.city, m.state, m.street, m.zip, m.name, m.dob, m.gender, m.height, m.weight, m.insurance, m.location, m.provider);
}

function addBill(m) {
    
}

module.exports = {
    setup
};