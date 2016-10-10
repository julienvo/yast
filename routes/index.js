'use strict'
var express = require('express');
var path = require('path');
var app = express();
var fs = require('fs');
var SGP4 = require('sgp4');
var utils = require('../utils/utils.js')

var tle = {};
exports.tle = tle;

app.get('/', (req, res) => {
  let sat = req.query.sat || 'ISS (ZARYA)'
  let satTLE = tle[sat];
  let issSatRec = SGP4.twoline2rv(satTLE[0], satTLE[1], SGP4.wgs84());
  let now = new Date();
  let gc0 = utils.getElements(issSatRec, now).gC;

  // Calcul de la période du satellite
  let periode = ((2 * Math.PI) * (gc0.height + 6378.135)) * (Math.sqrt((gc0.height + 6378.135)/398600.8)) / 60;
  console.log(periode);

  // On récupère les positions toutes les minutes pour les deux prochaines orbites
  var satPos = [];
  for(let i = 0; i < 2 * periode; i++){
    let time = new Date(now.valueOf() + 60000 * i)
    // This will contain ECI (http://en.wikipedia.org/wiki/Earth-centered_inertial) coordinates of position and velocity of the satellite
    let elem = utils.getElements(issSatRec, time);
    satPos.push({alt: elem.gC.height, lat:elem.lat, lng: elem.lon, timestamp: time});
  };
  if(req.xhr){
    res.json({timestamp: now.getTime(), satPos: satPos, currentSat: sat});
  }
  else{
    res.render('index', {timestamp:now.getTime(), listeSat: Object.keys(tle), satPos: satPos, currentSat: sat});
  }
});

module.exports.app = app;