/**
 * Created by jordankauffman on 9/9/16.
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

// Writes data to the database.
//function writeUserData(netID, name) {
//    //takeSnapshot();
//    //var name = document.getElementById("student_name").value;
//    //var netID = document.getElementById("netID").value;
//    if(netID != "" && netID != null && name != "" && name != null)
//    {
//        database.ref('users/Professor/' + netID).set({
//            last_seen: getDate(),
//            name: name
//        });
//    }
//
//
//
//}

// Retrieves data from the Database. Organized by student id
//function retrieveUserData(netID, onCall){
//    //var netID = document.getElementById("netID").value;
//    var data = firebase.database().ref('users/Professor/' + netID);
//    data.on('value', onCall);
//}

// Tested and works. Change the path to the correct student id, then it is good to go.
//function updateLastSeenDate(netID)
//{
//    //var netID = document.getElementById("netID").value;
//
//    var updates = {};
//
//    updates['users/Professor/' + netID + '/last_seen'] = getDate();
//
//    database.ref().update(updates);
//
//    return true;
//}

//// borrowed from http://stackoverflow.com/questions/1531093/how-to-get-current-date-in-javascript
//function getDate()
//{
//    var today = new Date();
//    var dd = today.getDate();
//    var mm = today.getMonth()+1; //January is 0!
//    var yyyy = today.getFullYear();
//
//    if(dd<10) {
//        dd = '0' + dd
//    }
//
//    if(mm<10) {
//        mm = '0' + mm
//    }
//
//    today = mm + '/' + dd + '/' + yyyy;
//    return today;
//
//}