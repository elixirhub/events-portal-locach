var mongo = require('mongodb-singleton')(
  null,
  null,
  'geonames',
  ['countryInfo', 'allCountries', 'cities15000']
);


module.exports = function (html, callback) {

  mongo(function (err, collections) {
    if (err) return callback(err);

    collections.countryInfo.find({}).toArray(function (err, allCountries) {
      if (err) return callback(err);

      var isos = []
        , isos3 = []
        , countries = []
        , fips = [];

      for (var i = 0; i < allCountries.length; i++) {
        if (allCountries[i].ISO) isos.push(allCountries[i].ISO);
        if (allCountries[i].ISO3) isos3.push(allCountries[i].ISO3);
        if (allCountries[i].country)
          countries.push('(?:' + allCountries[i].country + ')');
        if (allCountries[i].fips) fips.push(allCountries[i].fips);
      }

      var regex = new RegExp(
         '\\s'
        + '('
          + isos.join('|') + '|'
          + isos3.join('|') + '|'
          + countries.join('|') + '|'
          + fips.join('|')
        + ')'
        +'\\s'
        , 'g'
      );

      var arr;
      var countriesFound = [];

      while ((arr = regex.exec(html)) !== null) {
        countriesFound.push({
          "value": arr[1],
          "index": regex.lastIndex - arr[0].length + 1 // \\W
        });
      }

      callback(null, countriesFound);

    });
  });
};
