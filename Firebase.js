/**
 * Created by jordankauffman on 10/6/16.
 */


// Initialize Firebase
var config = {
    apiKey: "AIzaSyCMl-B7FbEVqMacAqW6zjMG9DhWKU0vf4M",
    authDomain: "health-io-cs-329.firebaseapp.com",
    databaseURL: "https://health-io-cs-329.firebaseio.com",
    storageBucket: "health-io-cs-329.appspot.com",
    messagingSenderId: "663234114526"
};
firebase.initializeApp(config);

var database = firebase.database();

// Writes data to the root of the patient. I am hoping that this works and doesn't ruin the object
function createPatient(patientID, city, state, street, zip, name, dob, gender, height, weight, insurance, location, provider ) {

    var addressDict = {
        "City" : city,
        "State" : state,
        "Street" : street,
        "Zip" : zip
    };

    database.ref('Patients/' + patientID + '/').set({
        Address : addressDict,
        Name : name,
        DOB : dob,
        Gender : gender,
        Height : height,
        Weight : weight,
        Insurance : insurance,
        Location : location,
        Provider : provider
    });
}


// Retrieves data from the Database. key will need to be a path if it is going into a dictionary within the object
function retrieveUserData(patientID, key, onCall){

    var data = database.ref('Patients/' + patientID + '/' + key);
    data.on('value', onCall);
}

function getAllPatientNames(){

    return database.ref('Patients/').once('value').then(function(snapshot) {
        var val = snapshot.val();

        var label = [];
        for(var i in val){
            label.push(i);
        }

        var name = [];
        for(var i = 0; i < label.length;i++) {
            console.log(i);
            name.push(val[label[i]].Name);
        }

        console.log(name);

    });

}

function getBasicPatientInfo() {
    return database.ref('Patients/').once('value').then(function(snapshot) {
        var val = snapshot.val();

        var label = [];
        for(var i in val){
            label.push(i);
        }

        var list = [];
        for(var i = 0; i < label.length;i++) {
            console.log(i);
            var obj = {
                'pid' : val[label[i]],
                'name' : val[label[i]].Name
            };

            list.push(obj);
        }

        console.log(list);

    });
}


function updatePatientInfo(patientID, value, updatedInfo) {

    var updates = {};
    updates['Patients/' + patientID + '/' + value] = updatedInfo;

    return database.ref().update(updates);
}