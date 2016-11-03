var FB = require("./Firebase.js");

var room;

var subs = {};

/********
Consumer Methods
*********/
function setup(io) {
    if (!io) {
        console.log('CRITICAL ERROR IN CONSUMER: NO SERVER FOUND!');
        return;
    }
    console.log('Running setup for CONSUMER');

    room = io.of('/consumer');

    room.on('connect', function(socket) {
        //setup specific callbacks
        console.log('Connection made to consumer');

        socket.on('subscribe to patient', function(pid) {

            //Setup Object for binding
            var obj = {
                pid: pid,
                sendToConsumer: function(patient) {
                    console.log("Sending patient data to consumer");
                    patient.pid = this.pid;
                    console.log(patient.pid + ' : ' + patient.Name);
                    socket.emit("patient data", patient);
                }
            };


            //Call DB and set callback method
            FB.retrieveUserData(pid, "", function(snapshot) {
                // Check if valid
                if(!snapshot.val()) {
                    console.log('Patient does not Exist!');
                    return;
                }
                obj.sendToConsumer(snapshot.val());
            });


            //Check if already in subs
            if (!subs.hasOwnProperty(pid)) {
                //Not registered yet
                subs[pid] = {
                    list: []
                };
            }

            //Add socket to list of subs
            subs[pid].list.push(socket);
        });

        socket.on('unsubscribe', function(pid) {
            console.log('Request to unsubscribe from ' + pid);

            //Check if valid
            if (!subs[pid]) {
                console.log('Failed to unsubscribe');
                return
            }

            var index = subs[pid].list.indexOf(socket);
            //Remove subsriber from list for pid
            subs[pid].list.splice(index, 1);
        })

        socket.on('disconnect', function() {
            console.log('Disconnected from consumer');
        })
    })

}

function sendUpdate(pid, update) {
    console.log('Sending update data about ' + pid);

    if (!subs[pid]) {
        console.log(pid + ' has no subscribers. Making empty list');
        subs[pid] = {
            list: []
        }
    }
    else {
        console.log(pid + ' has ' + subs[pid].list.length + ' subscribers.');
    }

    //Create message to send
    var message = {
        pid: pid,
        update: update
    };

    //Send to subs
    for (var i = 0; i < subs[pid].list.length; i++) {
        subs[pid].list[i].emit('update', message);
    }
}

module.exports = {
    setup,
    sendUpdate
};