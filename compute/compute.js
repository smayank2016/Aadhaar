var path = require('path');
var fs = require('fs');
var Async = require('async');
var setcollection = require('collections/set');
var jsonfile = require('jsonfile');
var masterarray = [];


var performCalc = function(callback) {
    console.log('Starting Master Sync');
    var masterfile = path.resolve('./mstfolder/masterdata.json');
    var datafile = path.resolve('./mstfolder/data.json');
    var mstrdata = [];
    var jsonstring;
    var jsonset = new setcollection();
    Async.waterfall([
            function(searchindatacallback) {
                console.log('Taking MasterFile as Base, searching in the Data File');
                try {
                    JSON.parse(fs.readFileSync(masterfile))
                        .map(function(content) {
                            if (isPresentInData(content.State, content.District) == true) {
                                JSON.parse(fs.readFileSync(datafile))
                                    .forEach(function(jsoncont) {
                                        // console.log('In jsoncont ' + content.State + "," + jsoncont.State);
                                        if (content.State == jsoncont.State && content.District == jsoncont.District) {
                                            jsonstring = {
                                                "State": jsoncont.State,
                                                "District": jsoncont.District,
                                                "Aadhaar generated": (content["Aadhaar generated"] + jsoncont["Aadhaar generated"]),
                                                "Enrolment Rejected": (content["Enrolment Rejected"] + jsoncont["Enrolment Rejected"])
                                            };
                                        }
                                    });
                            } else {
                                jsonstring = {
                                    "State": content.State,
                                    "District": content.District,
                                    "Aadhaar generated": content["Aadhaar generated"],
                                    "Enrolment Rejected": content["Enrolment Rejected"]
                                };
                            }
                            jsonstring == "" ? "" : masterarray.push(jsonstring);
                            jsonstring = "";
                        });
                } catch (ex) {
                    console.log(ex);
                }
                console.log('Taking MasterFile as Base, searching in the Data File : Finished');
                searchindatacallback(null);
            },
            function(searchinmastercallback) {
                console.log('Taking DataFile as Base, searching in the Master File');
                JSON.parse(fs.readFileSync(datafile))
                    .map(function(jsoncont) {
                        if (isPresentInMaster(jsoncont.State, jsoncont.District) == false) {
                            jsonstring = {
                                "State": jsoncont.State,
                                "District": jsoncont.District,
                                "Aadhaar generated": jsoncont["Aadhaar generated"],
                                "Enrolment Rejected": jsoncont["Enrolment Rejected"]
                            };
                        }
                        jsonstring == "" ? "" : masterarray.push(jsonstring);
                        jsonstring = "";
                    });
                console.log('Taking DataFile as Base, searching in the Master File:Finished');
                searchinmastercallback(null);
            },
            function(resultcallback) {
                console.log('Writing Synced data back to Master File');
                jsonfile.writeFileSync(masterfile, masterarray);
                console.log('Writing Synced data back to Master File:Finished');
                resultcallback(null);
            }
        ],
        function(err, result) {
            if (err) {
                console.log(err);
            }
            // console.log(result);
        });
    callback('Done');
}
var getCounts = function(statename, callback) {
    console.log('In getCounts' + statename);
    var masterfile = path.resolve('./mstfolder/masterdata.json');
    var dataarray = [];
    var temparray = [];
    JSON.parse(fs.readFileSync(masterfile)).forEach(function(state) {
        if (state.State == statename) {
            // console.log(state.District);
            dataarray.push({
                // "State": state.State,
                "District": state.District,
                "Aadhaar Generated": state["Aadhaar generated"],
                "Enrolment Rejected": state["Enrolment Rejected"]
            });
        }
    });

    // console.log(dataarray);

    callback(dataarray);
}
var getStateCounts = function(callback) {
    var masterfile = path.resolve('./mstfolder/masterdata.json');
    var dateUpdatedfile = path.resolve("./mstfolder/updateddate.txt");
    var dateUpdated = '';
    var dataarray = [];
    var set = new setcollection();
    var Aadhaar_Generated = 0
    console.log('In getStateCounts');
    dateUpdated = fs.readFileSync(dateUpdatedfile).toString();
    console.log(dateUpdated);
    var content = JSON.parse(fs.readFileSync(masterfile));
    content.forEach(function(data) {
        set.add(data.State);
    });
    // console.log(set);
    set.forEach(function(stateset) {
        JSON.parse(fs.readFileSync(masterfile)).forEach(function(masterdata) {
            if (stateset == masterdata.State) {
                Aadhaar_Generated = Aadhaar_Generated + masterdata["Aadhaar generated"];
            }
        });
        dataarray.push({
            "State": stateset,
            "Country": "India",
            "Aadhaar Generated": Aadhaar_Generated,
            "Date Updated": dateUpdated
        });
        Aadhaar_Generated = 0;
    });

    dataarray.sort(function(a, b) {
        return a["Aadhaar Generated"] - b["Aadhaar Generated"];
    }).reverse();
    callback(dataarray);
}

var getStates = function(callback) {
    var masterfile = path.resolve('./mstfolder/masterdata.json');
    var dataset = new setcollection();
    var dataarray = [];
    JSON.parse(fs.readFileSync(masterfile)).forEach(function(masterdata) {
        if (dataarray.indexOf(masterdata.State) == -1) {
            dataarray.push(masterdata.State);
        }

    });
    callback(dataarray);
}

function isPresentInMaster(statename, districtname) {
    var masterdata = JSON.parse(fs.readFileSync((path.resolve('./mstfolder/masterdata.json'))));
    for (var i = 0; i < masterdata.length; i++) {
        if (masterdata[i].State == statename && masterdata[i].District == districtname) {
            return true;
        }
    }
    return false;
}

function isPresentInData(statename, districtname) {
    var tempdata = JSON.parse(fs.readFileSync((path.resolve('./mstfolder/data.json'))));
    for (var i = 0; i < tempdata.length; i++) {
        if (tempdata[i].State == statename && tempdata[i].District == districtname) {
            return true;
        }
    }
    return false;
}

var methods = {};
methods.performCalc = performCalc;
methods.getCounts = getCounts;
methods.getStates = getStates;
methods.getStateCounts = getStateCounts;
module.exports = methods;
