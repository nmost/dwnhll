/**
 * Constants
 */

var MONGODB_URL = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL || 'mongodb://localhost/test';

/**
 * Module dependencies.
 */

var express = require('express')
  , gm = require("googlemaps")
  , mongoose = require('mongoose');

gm.config("encode-polylines", false);
gm.config("google-private-key", process.env.MAPS_API_KEY);
var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Database Stuff

mongoose.connect(MONGODB_URL);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', initDatabase);

function initDatabase() {
  var routeSchema = mongoose.Schema({
    startLoc: 'Number',
    endLoc: 'Number',
    bounds: [],
    copyrights: 'String',
    legs: [],
    overview_polyline: [],
    summary: 'String',
    warnings: [],
    waypoint_order: []
  });
}

// Routes and Logix

//pageload
app.get('/', function(req, res){
  res.render('index', { title: 'dwnhll' })
});

//getRoute
app.get('/route/:startLoc/:endLoc', function(req, res){
  startLocMatches = [];
  endLocMatches = [];
  gm.geocode(req.params.startLoc, function(err, data){
    if (err || !data.results) {
      console.log("Well fuck.");
    }
    else {
      var result;
      for (var i = 0; i < data.results.length; i++) {
        result = data.results[i];
        startLocMatches.push({
          address : result.formatted_address,
          coords  : result.geometry.location
        });
      }
      gm.geocode(req.params.endLoc, function(err, data){
        if (err || !data.results) {
          console.log("Well doublefuck")
        }
        else {
          var result;
          for (var i = 0; i < data.results.length; i++) {
            result = data.results[i];
            endLocMatches.push({
              address : result.formatted_address,
              coords  : result.geometry.location
            });
          }
          if (startLocMatches.length > 1 || endLocMatches.length > 1) {
            var resultObj = {
              status: 300,
              startLocationMatches : startLocMatches,
              endLocationMatches   : endLocMatches
            };
            res.send(resultObj);
          }
          else { //we've got coordinates baby. Let's get cracking
            if ( false /*DB MATCH FOUND*/) {
              res.send(whateverWeFind);
            }
            else {
              gm.directions(
                startLocMatches[0].coords.lat + "," + startLocMatches[0].coords.lng,
                endLocMatches[0].coords.lat + "," + endLocMatches[0].coords.lng,
                function(err, directionsData) {
                  if (!directionsData || !directionsData.routes || err) {
                    return;
                  }
                  var scores = [];
                  var delta = 0;
                  var samples;
                  var i = 0;
                  for (var i = 0; i < directionsData.routes.length; i++) {
                    scores[i] = 0;
                    (function(i) {
                      samples = Math.ceil(directionsData.routes[i].legs[0].distance.value/250);
                      samples = samples > 10 ? 10 : samples; //TODO:CHANGE THIS to something fucking reasonable
                      gm.elevationFromPath("enc:" + directionsData.routes[i].overview_polyline.points,
                        samples,
                        function(err, elevationData) {
                          for (var k = 1; k < elevationData.results.length; k++) { //TODO better score tabulation algo
                            delta = elevationData.results[k].elevation - elevationData.results[k-1].elevation;
                            scores[i] += delta > 0 ? delta * 1.5 : delta;
                          }
                          if (scores.length == i+1) {
                            var currMax = Number.NEGATIVE_INFINITY;
                            var maxArrLocation = 0;
                            for (var l = 0; l < scores.length; l++) {
                              if (scores[i] > currMax) {
                                currMax = scores[i];
                                maxArrLocation = i;
                              }
                            }
                            console.log(directionsData.routes[maxArrLocation]);
                          }
                        }, false);
                    })(i);
                  }
                },
                false,
                "driving",
                [],
                true,
                "tolls|highways",
                "metric"
              );
            }
          }
        }
      }, false);
    }
  }, false);
});

app.listen(process.env.PORT || 5000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
