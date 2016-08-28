var path = require('path');
var Async = require('async');
var jsonfile = require('jsonfile');
var fs = require('fs');
var request = require('request');
var unzip = require('unzip');
var computemaster = require('../compute');
var compute = computemaster.compute;

var dateUpdated = '';


var processaddata = function(callback) {
    console.log('In Service');
    var filepath = path.resolve("./tmp/");
    var tmpfile = path.resolve("./tmp/data.zip");
    var csvfile = path.resolve("./tmp/*.csv");
    var jsonfile = path.resolve("./mstfolder/data.json");
    var dateUpdatedfile = path.resolve("./mstfolder/updateddate.txt");
    var url = 'https://data.uidai.gov.in/uiddatacatalog/rest/UIDAI-ENR-GEOGRAPHY';
    // compute.performCalc(callback);


    if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath);
    }
    request({
        url: url,
        encoding: null,
        "rejectUnauthorized": false
    }, function(err, resp, body) {
        if (err) {
            callback(err);
            return;
        }
        fs.writeFile(tmpfile, body, function(err) {
            console.log("file written!");
            fs.exists(tmpfile, function(exists) {
                if (exists) {
                    console.log('Exists');
                    var extract = require('extract-zip')
                    extract(tmpfile, {
                        dir: path.resolve("./tmp")
                    }, function(err) {
                        if (err) {
                            console.log(err);
                            callback('Error in unzipping' + err);
                            return;
                        }
                        require('glob')(csvfile, function(er, files) {
                            // console.log(files);
                            for (file in files) {
                                // console.log(files[file]);
                                Async.waterfall([
                                        function(csvcallback) {
                                            console.log('In csvtojson');
                                            var Converter = require("csvtojson")
                                                .Converter;
                                            var converter = new Converter({});
                                            converter.on("end_parsed", function(jsonArray) {
                                                // console.log(jsonArray); //here is your result jsonarray
                                                require('jsonfile')
                                                    .writeFileSync(jsonfile, jsonArray);
                                                csvcallback(null);
                                            });

                                            require("fs")
                                                .createReadStream(files[file])
                                                .pipe(converter);
                                        },

                                        function(deletecallback) {
                                            console.log('In delete');
                                            fs.readdirSync(filepath)
                                                .forEach(function(item) {
                                                    console.log('Downloaded File name is : ' + item);
                                                    fs.unlink(filepath + '//' + item);
                                                    console.log('Temp File Deleted');
                                                });
                                            deletecallback(null);
                                        }
                                    ],
                                    function(err, result) {
                                        if (err) {
                                            return console.log(err)
                                        }
                                    });
                            }
                        });
                    });
                    callback('Done');
                } else {
                    console.log('Not exists');
                    callback('Error: File doesnt exists');
                    return;
                }
            });
            // console.log(tmpfile);
        });
    });

}
var getCounts = function(statename, callback) {
    compute.getCounts(statename, callback);
}
var syncmaster = function(callback) {
    compute.performCalc(callback);
}
var getStates = function(callback) {
    compute.getStates(callback);
}
var getStateCounts = function(callback) {
    compute.getStateCounts(callback);
}

var methods = {};
methods.processaddata = processaddata;
methods.getCounts = getCounts;
methods.syncmaster = syncmaster;
methods.getStates = getStates;
methods.getStateCounts = getStateCounts;
module.exports = methods;
