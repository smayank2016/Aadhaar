var path = require("path");
var express = require("express");
var service = require("../service");
var analyzerservice = service.analyzer;
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static(path.join(__dirname, 'public')));

var serveindex = function(req, res) {
    // res.sendFile(path.resolve("public/git.html"));
    res.sendFile(path.resolve("public/aadhar.html"));
}

var processaddata = function(req, res) {
    var callback = function(data) {
        res.setHeader('Content-Type', 'application/json');
        res.json(data);
    }
    console.log('In Controller');
    analyzerservice.processaddata(callback);
}
var getCounts = function(req, res) {
    var callback = function(data) {
        res.setHeader('Content-Type', 'application/json');
        res.json(data);
    }
    analyzerservice.getCounts(decodeURIComponent(req.body.state), callback);
}
var syncmaster = function(req, res) {
    var callback = function(data) {
        res.setHeader('Content-Type', 'application/json');
        res.json(data);
    }
    analyzerservice.syncmaster(callback);
}
var getStates = function(req, res) {
    var callback = function(data) {
        res.setHeader('Content-Type', 'application/json');
        res.json(data);
    }
    analyzerservice.getStates(callback);
}
var getStateCounts = function(req, res) {
    var callback = function(data) {
        res.setHeader('Content-Type', 'application/json');
        res.json(data);
    }
    analyzerservice.getStateCounts(callback);
}
var methods = {};
methods.processaddata = processaddata;
methods.serveindex = serveindex;
methods.getCounts = getCounts;
methods.syncmaster = syncmaster;
methods.getStates = getStates;
methods.getStateCounts = getStateCounts;
module.exports = methods;
