var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var counter = 0;

var PB = {
    '0094': {
        name: 'Alex Berns',
        pid: '0094',
        last_heart: 0,
        last_gluc: 0,
        last_oxyg: 0,
        crit_heart: 90,
        crit_gluc: 30,
        crit_oxyg: 60
    },
    
    '0000':{
        name: 'Pepsi Sam',
        pid: '0000',
        last_heart: 0,
        last_gluc: 0,
        last_oxyg: 0,
        crit_heart: 80,
        crit_gluc: 70,
        crit_oxyg: 55
    }
}

var MB = {
    ps123456: {
        mid: 'ps123456',
        pid: '0094',
        type: 'heart'
    },
    
    ps000000: {
        mid: 'ps000000',
        pid:'0000',
        type: 'heart'
    }, 
    
    gl111222:{
        mid: 'gl111222',
        pid: '0094',
        type: 'gluc'
    }
}

var openRooms = {};

app.get('/', function(req, res) {
    if(counter % 2 == 0){
        res.sendFile(__dirname + '/producer.html');
    } else {
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

http.listen(process.env.PORT, function() {
    console.log('listening on ' + process.env.PORT);
});

//CODE

io.on('connection', function(socket) {
    console.log('Connected to producer');
    socket.on('patient update', recievePatientUpdate);
    
});

function recievePatientUpdate(update) {
    //Patient Data is recieved
    console.log(update.mid + ': ' + update.data);
    
    var mid = update.mid;
    var mType = MB[mid].type;
    var pid = MB[mid].pid;
    
    //Send to database for updating
    if(mType == 'heart'){
        PB[pid].last_heart = update.data;
        
        //Check if alert is needed
        if(update.data > PB[pid].crit_heart){
            sendAlert(pid, mType, update);
        }
    } else if(mType == 'gluc') {
        PB[pid].last_gluc = update.data;
        
        //Check if alert is needed
        if(update.data > PB[pid].crit_gluc){
            sendAlert(pid, mType, update);
        }
    } else if(mType == 'oxyg'){
        PB[pid].last_oxyg = update.data;
        
        //Check if alert is needed
        if(update.data > PB[pid].crit_oxyg){
            sendAlert(pid, mType, update);
        }
    }
    
    
    
    
}

function sendAlert(pid, type, update) {
    //Prepare to send Alert
    
    
    //Check if room is already open
    if(!openRooms.hasOwnProperty(pid)){
        openRooms[pid] = io.of('/' + pid);
    }
    
    var message = "ALERT: " + pid + " has a critical status for " + type;
    
    
    //Send to socket
    openRooms[pid].emit('alert', message);
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