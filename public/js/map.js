$('span.sat').click((event)=>{
  getSatPos($(event.target).html());
});

// new gmap
var mymap = new google.maps.Map(document.getElementById('mapid'), {
  center: satPos[0],
  zoom: 4,
  mapTypeId: google.maps.MapTypeId.SATELLITE,
  streetViewControl: false,
  mapTypeControl: false
});

// Affiche les 2 prochaines orbites
var satPath = new google.maps.Polyline({
  path: satPos,
  geodesic: true,
  strokeColor: '#FF0000',
  strokeOpacity: 1.0,
  strokeWeight: 3
});
satPath.setMap(mymap);

// Affiche la zone depuis laquelle le satellite est théoriquement visible (ne prend pas en compte le fait qu'il fasse jour ou que le satellite ne soit pas éclairé)
var footprint = new google.maps.Circle({
  strokeColor: '#0000FF',
  strokeOpacity: 1.0,
  strokeWeight: 2,
  fillColor: '#00FF',
  fillOpacity: 0.35,
  map: mymap,
  center: mymap.center,
  radius: Math.sqrt(Math.pow(satPos[0].alt * 1000,2) + (2 * 6378135 * satPos[0].alt * 1000)) // Distance à l'horizon en fonction de l'altitude
});

var marker = new google.maps.Marker({
  map: mymap,
  draggable: false,
  position: mymap.center
});



// Self-explanatory
new DayNightOverlay({
    map: mymap
});


// Remplit la fenêtre d'infos
  $('#satelliteName').html(currentSat);
  $('#latitude').html('Lat : ' + satPos[0].lat);
  $('#longitude').html('Lon : ' + satPos[0].lng);
  $('#altitude').html('Alt : ' + satPos[0].alt);




// Extrapole la position du satellite entre 2 positions données dans le tableau
var posOffset = (pointA, pointB, tempsPasse) =>{
  return (pointA * (60 - tempsPasse) + pointB * tempsPasse) / 60;
};

// Récupère un tableau contenant les positions d'un satellite à chaque minute pour ses deux prochaines orbites et remet à jour l'affichage
var getSatPos = (sat) => {
  $.get('/', {sat:sat}, (res) => {
    satPos = res.satPos;
    satPath.setPath(satPos);
    footprint.setCenter(satPos[0]);
    footprint.setRadius(Math.sqrt(Math.pow(satPos[0].alt * 1000,2) + (2 * 6378135 * satPos[0].alt * 1000)));
    timestamp = res.timestamp;
    currentSat = res.currentSat;
    $('#satelliteName').html(currentSat);
    $('#latitude').html('Lat : ' + coordToDMS(satPos[0].lat, false));
    $('#longitude').html('Lon : ' + coordToDMS(satPos[0].lng, true));
    $('#altitude').html('Alt : ' + satPos[0].alt.toFixed(3) + ' km');
  });
}

// Coordonnées décimales en Degré/Minutes/Secondes
var coordToDMS = function(D, latOrLng){
  let dir = D<0?latOrLng?'W':'S':latOrLng?'E':'N';
  let deg = 0|(D<0?D=-D:D);
  let min = 0|D%1*60;
  let sec = (0|D*60%1*6000)/100;
  return deg + '° ' + min + '\' ' + sec + '" ' + dir;
};

// Mise à jour de la position du satellite toutes les deux secondes
var move = setInterval(function(){
  let date = Date.now();
  let timeElapsed = new Date(date - timestamp);
  let minutesElapsed = timeElapsed.getMinutes();
  let secondsElapsed = timeElapsed.getSeconds();
  if(minutesElapsed > satPos.length - 2){ // Last minute, time to update data
    getSatPos(currentSat);
  }

  let newLat = posOffset(satPos[minutesElapsed].lat, satPos[minutesElapsed + 1].lat, secondsElapsed);
  let newLon = posOffset(satPos[minutesElapsed].lng, satPos[minutesElapsed + 1].lng, secondsElapsed);
  let newAlt = posOffset(satPos[minutesElapsed].alt, satPos[minutesElapsed + 1].alt, secondsElapsed);
  footprint.setCenter({lat: newLat, lng: newLon});
  marker.setPosition({lat: newLat, lng: newLon});
  footprint.setRadius(Math.sqrt(Math.pow(newAlt * 1000,2) + (2 * 6378135 * newAlt * 1000)));
  $('#latitude').html('Lat : ' + coordToDMS(newLat, false));
  $('#longitude').html('Lon : ' + coordToDMS(newLon, true));
  $('#altitude').html('Alt : ' + newAlt.toFixed(3) + ' km');

}, 2000);