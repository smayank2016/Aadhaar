var express = require('express');
var path = require('path');
var controller = require('../controller');
var compute = require('../compute');
var analyzecontroller = controller.analyzer;
var computecontroller = compute.compute;
var router = express.Router();

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index.html', { title: 'Express' });
// });
router.use("/public", express.static(path.join(__dirname, '../..', 'public')));
// router.use("/report/")
router.get('/index', analyzecontroller.serveindex);
router.get('/getaddata', analyzecontroller.processaddata); //To download csv from Aadhaar website
router.post('/servedata', analyzecontroller.getCounts);
router.get('/syncmaster', analyzecontroller.syncmaster);
router.get('/getStates', analyzecontroller.getStates);
router.get('/getStateCounts', analyzecontroller.getStateCounts);
// router.post('/getaddata', computecontroller.performCalc);
module.exports = router;
