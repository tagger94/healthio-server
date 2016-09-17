var socket = io('/admin');
socket.on('connect', function() {
    socket.emit('request patient list', "");

    socket.on('patient list', usePatientList)
})

var patientList;

var pid = [5, 10, 15, 20, 25];

function usePatientList(patientList){
    d3.select("body").selectAll("p")
    .data(dataset)
    .enter()
    .append("p")
    .text(function(d) {
        return d;
    });
}


