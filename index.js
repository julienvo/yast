'use strict'
var express = require('express');
var path = require('path');
var app = express();
var fs = require('fs');
//var users = require('./routes/users');
var routes = require('./routes/index').app;

// Initialize TLE list

fs.readFile(path.join(process.cwd(), 'tle.txt'), 'utf8', (err, data)=>{
  let lignes = data.split('\r\n');
  for(let i = 0; i< lignes.length; i+=3){
    if(i+3 < lignes.length){
      let nomOrbital = lignes[i].trim();
      require('./routes/index').tle[nomOrbital] = [];
      require('./routes/index').tle[nomOrbital].push(lignes[i+1]);
      require('./routes/index').tle[nomOrbital].push(lignes[i+2]);
    }
  }
});

app.use(express.static(path.join(__dirname,'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


app.use('/', routes);

// Erreur 404
app.use(function(req, res, next) {
  res.status(404).send('<h1>Error 404 - This is not the URL you are looking for</h1>');
});
var port = process.env.PORT || 8080;
var server = app.listen(port, function(){
  var adresseHote = server.address().address;
  var portEcoute = server.address().port;
  console.log('Server online at http://%s%s', adresseHote, portEcoute);
});