// Get TLEs from celestrak.com and saves them to tle.txt, to do a few times per week

var http = require('http');
var fs = require('fs');
var path = require('path');

http.get('http://celestrak.com/NORAD/elements/stations.txt').on('response', (response) => {
  var body = '';
  var i = 0;
  response.on('data', function (chunk) {
    body += chunk;
  });
  response.on('end', function () {
    fs.writeFile(path.join(__dirname, 'tle.txt'), body, (err)=>{
      if(err) {
        return console.log(err);
      }

      console.log("The file was saved!");
    });
  });
});