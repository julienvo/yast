'use strict'
var SGP4 = require('sgp4');


// Calcule les coordonnées spatiale d'un satellite à un moment donné
exports.getElements = function(satRec, time){
  time = time || new Date();
  let positionAndVelocity = SGP4.propogate(satRec, time.getUTCFullYear(), time.getUTCMonth() + 1, time.getUTCDate(), time.getUTCHours(), time.getUTCMinutes(), time.getUTCSeconds());
  
  // GMST required to get Lat/Long
  let gmst = SGP4.gstimeFromDate(time.getUTCFullYear(), time.getUTCMonth() + 1, time.getUTCDate(), time.getUTCHours(), time.getUTCMinutes(), time.getUTCSeconds());
  
  // Geodetic coordinates
  let geodeticCoordinates = SGP4.eciToGeodetic(positionAndVelocity.position, gmst);
  
  // Coordinates in degrees
  let longitude = SGP4.degreesLong(geodeticCoordinates.longitude);
  let latitude = SGP4.degreesLat(geodeticCoordinates.latitude);


  return {gC: geodeticCoordinates, lon: longitude, lat:latitude};
}