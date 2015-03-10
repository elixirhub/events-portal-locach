var htmlparser = require('htmlparser2');

var lib = {
  inspect: {
    "countries": require('./inspect/countries.js'),
    "cities": require('./inspect/cities.js')
  }
};


/**
 * @param {String} html
 * @param {Function} callback
 *
 * @returns {Object} Locations found.
 */

module.exports = function (html, callback) {

  var locations = [];
  var text = '';

  var bool = true; // used for ignoring scripts

  var parser = new htmlparser.Parser({
    "onopentag": function (name, attribs) {
      if (name === 'script') bool = false;
    },
    "ontext": function (chunk) {
      if (bool) text += ' ' + chunk;
    },
    "onclosetag": function (tagname) {
      if (tagname === 'script') bool = true;
    }
  }, {
    normalizeWhitespace: true
  });

  parser.write(html);
  parser.end();

  // finding countries
  lib.inspect.countries(text, function (err, countries) {
    if (err) return callback(err);

    console.log(countries);

    // finding cities
    lib.inspect.cities(text, countries, function (err, cities) {
      if (err) return callback(err);

     console.log(cities);

    });
  });

};
