/**
 * Modules dependencies
 */

var url = require('url');
var http = require('http');
var https = require('https');
var util = require('util');

var lib = {
  "locach": require('./lib/locach.js')
};


for (var i = 2, c = 2; i < process.argv.length; i++) {
  (function (i) {

    var urlToInspect = process.argv[i];

    (url.parse(urlToInspect).protocol === 'http:' ? http : https)
    .get(urlToInspect, function (res) {

      var htmlReceived = '';
      res.setEncoding('utf8');

      res.on('data', function (chunk) {
        htmlReceived += chunk;
      });

      res.on('end', function () {

        lib.locach(htmlReceived, function (err, locations) {
          if (err) return console.error(err);

          console.log(res.statusCode + ' - ' + urlToInspect + ' ...');
          console.log(util.inspect(locations, {colors: true, depth: null}));
          if (++c !== process.argv.length) console.log('\n');

        });

      });

    }).on('error', function (err) {
      console.error(err);
    });

  })(i);
}
