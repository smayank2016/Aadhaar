var path = require('path');
var fs = require('fs');
var Async = require('async');
var setcollection = require('collections/set');
var jsonfile = require('jsonfile');

var date = new Date();
var masterdate = '';
var performCalc = function(callback) {
    var masterarray = [];
    console.log('Starting Master Sync');
    var masterfile = path.resolve('./mstfolder/masterdata.json');
    var datafile = ''; //path.resolve('./mstfolder/data.json');
    var filepath = path.resolve("./tmp/");
    var checkToContinueFilePath = path.resolve('./tmp/*.json');
    var mstrdata = [];
    var filename = ''
    var jsonstring;
    var masterdate = '';
    var localdate = '';
    var jsonset = new setcollection();
    // masterarray.length = 0;
    require('glob')(checkToContinueFilePath, function(er, files) {
        files.forEach(function(file) {
            filename = file.substring(file.lastIndexOf('/') + 1);
            datafile = path.resolve('./tmp/' + filename);
            dateUpdated = (file).substr(((file).lastIndexOf('.') - 8), 8);
            console.log("Downloaded file date is  " + dateUpdated);
            // console.log(dateUpdated.substr(0, 4) + '-' + dateUpdated.substr(4, 2) + '-' + dateUpdated.substr(6, 2));
            localdate = Date.parse(dateUpdated.substr(0, 4) + '-' + dateUpdated.substr(4, 2) + '-' + dateUpdated.substr(6, 2));

            Async.waterfall([
                    function(searchindatacallback) {
                        console.log('Taking MasterFile as Base, searching in the Data File');
                        try {
                            JSON.parse(fs.readFileSync(masterfile))
                                .map(function(content) {
                                    // console.log(content["Date Updated"]);
                                    masterdate = Date.parse(content["Date Updated"].substr(0, 4) + '-' + content["Date Updated"].substr(4, 2) + '-' + content["Date Updated"].substr(6, 2));
                                    // console.log("Date from Master File " + masterdate);
                                    if (masterdate >= localdate) {
                                        // console.log('MasterDate is either EoG then localdate, hence skipped');
                                    } else {
                                        if (isPresentInData(content.State, content.District) == true) {
                                            JSON.parse(fs.readFileSync(datafile))
                                                .forEach(function(jsoncont) {
                                                    // console.log(jsoncont.State);
                                                    // console.log('In jsoncont ' + content.State + "," + jsoncont.State);
                                                    if (content.State == jsoncont.State && content.District == jsoncont.District) {
                                                        jsonstring = {
                                                            "State": jsoncont.State,
                                                            "District": jsoncont.District,
                                                            "Aadhaar generated": (content["Aadhaar generated"] + jsoncont["Aadhaar generated"]),
                                                            "Enrolment Rejected": (content["Enrolment Rejected"] + jsoncont["Enrolment Rejected"]),
                                                            "Date Updated": dateUpdated
                                                        };
                                                    }
                                                });
                                        } else {
                                            jsonstring = {
                                                "State": content.State,
                                                "District": content.District,
                                                "Aadhaar generated": content["Aadhaar generated"],
                                                "Enrolment Rejected": content["Enrolment Rejected"],
                                                "Date Updated": dateUpdated
                                            };
                                        }
                                        jsonstring == "" ? "" : masterarray.push(jsonstring);
                                        jsonstring = "";
                                    }
                                });
                        } catch (ex) {
                            console.log(ex);
                        }
                        console.log('Local Date is : ' + localdate);
                        console.log("Date from Master File " + masterdate);
                        console.log('Taking MasterFile as Base, searching in the Data File : Finished');
                        searchindatacallback(null);
                    },
                    function(searchinmastercallback) {
                        console.log('Taking DataFile as Base, searching in the Master File');
                        console.log('In searchinmastercallback ' + dateUpdated);
                        JSON.parse(fs.readFileSync(datafile))
                            .map(function(jsoncont) {
                                if (isPresentInMaster(jsoncont.State, jsoncont.District) == false) {
                                    jsonstring = {
                                        "State": jsoncont.State,
                                        "District": jsoncont.District,
                                        "Aadhaar generated": jsoncont["Aadhaar generated"],
                                        "Enrolment Rejected": jsoncont["Enrolment Rejected"],
                                        "Date Updated": dateUpdated
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
                        // console.log(masterarray);
                        console.log(masterarray[0]);
                        console.log(masterarray[1]);
                        if (masterarray[0] == undefined) {
                            console.log('Writing Synced data back to Master File:Skipped');
                        } else {
                            jsonfile.writeFileSync(masterfile, masterarray);
                            console.log('Writing Synced data back to Master File:Finished');
                        }

                        resultcallback(null);
                    },
                    function(deletecallback) {
                        console.log('In delete');
                        fs.readdirSync(filepath)
                            .forEach(function(item) {
                                // console.log('Downloaded File name is : ' + item);
                                fs.unlink(filepath + '//' + item);
                                console.log('File Deleted : ' + item);
                            });
                        deletecallback(null);
                    }
                ],
                function(err, result) {
                    if (err) {
                        console.log('error is ' + err);
                    }
                });
        });
    });
    console.log("here");

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
    // dateUpdated = fs.readFileSync(dateUpdatedfile).toString();
    // console.log('From File ' + dateUpdated);
    var content = JSON.parse(fs.readFileSync(masterfile));
    content.forEach(function(data) {
        set.add(data.State);
    });
    // console.log(set);
    set.forEach(function(stateset) {
        JSON.parse(fs.readFileSync(masterfile)).forEach(function(masterdata) {
            if (stateset == masterdata.State) {
                dateUpdated = masterdata["Date Updated"];
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
    console.log('Updated Date from master file ' + dateUpdated);
    dataarray.sort(function(a, b) {
        return a["Aadhaar Generated"] - b["Aadhaar Generated"];
    }).reverse();
    // console.log(date.toISOString().substring(0, 10).replace(/-/g, ''));
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
