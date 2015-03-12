var escapeStringRegExp = require('escape-string-regexp');

var mongo = require('mongodb-singleton')(
  null,
  null,
  'geonames',
  ['countryInfo', 'allCountries', 'cities15000']
);


module.exports = function (text, countriesFound, callback) {

  if (!countriesFound) return callback();

  mongo(function (err, collections) {
    if (err) return callback(err);

    var arr = [];
    for (var i = 0; i < countriesFound.length; i++)
      arr.push(countriesFound[i].value);

    var query = {
      $or: [
        { "ISO": {$in: arr} },
        { "ISO3": {$in: arr} },
        { "country": {$in: arr} },
        { "fips": {$in: arr} }
      ]
    };

    collections.countryInfo.find(query).toArray(function (err, countries) {
      if (err) return callback(err);

      var countriesCodes = [];
      for (var i = 0; i < countries.length; i++)
        countriesCodes.push(countries[i].ISO);

      collections.allCountries.find({"countryCode": {$in:
      countriesCodes}}).toArray(function (err, cities) {
        if (err) return callback(err);

        var citiesNames = [];

        for (var i = 0; i < cities.length; i++) {
          if (cities[i].name && typeof cities[i].name === 'string')
            citiesNames.push('(?:' + escapeStringRegExp(cities[i].name) + ')');
        }

        var regex = new RegExp(
            '\\W'
          + '('
            + citiesNames.join('|')
          + ')'
          + '\\W'
          , 'g'
        );

        var arr;
        var citiesFound = [];

        while ((arr = regex.exec(text)) !== null) {
          citiesFound.push({
            "value": arr[1],
            "index": regex.lastIndex - arr[0].length + 1 // \\W
          });
        }

        callback(null, citiesFound);

      });
    });
  });

};
