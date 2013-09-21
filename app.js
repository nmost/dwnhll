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
  var ObjectId = mongoose.Schema.Types.ObjectId;
  var routeSchema = mongoose.Schema({
    //various values will go here
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
                function(err, data) {
                  console.log(data);
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
