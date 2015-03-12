var mongo = require('mongodb-singleton')(
  null,
  null,
  'geonames',
  ['countryInfo', 'allCountries', 'cities15000']
);


module.exports = function (text, callback) {

  mongo(function (err, collections) {
    if (err) return callback(err);

    collections.countryInfo.find({}).toArray(function (err, allCountries) {
      if (err) return callback(err);

      var isos = []
        , isos3 = []
        , countriesList = []
        , fips = [];

      for (var i = 0; i < allCountries.length; i++) {
        if (allCountries[i].ISO) isos.push(allCountries[i].ISO);
        if (allCountries[i].ISO3) isos3.push(allCountries[i].ISO3);
        if (allCountries[i].country)
          countriesList.push('(?:' + allCountries[i].country + ')');
        if (allCountries[i].fips) fips.push(allCountries[i].fips);
      }

      var str = isos.join('|') + '|'
          + isos3.join('|') + '|'
          + countriesList.join('|') + '|'
          + fips.join('|');

      var regex = new RegExp(

            '[ ,\n]'
          + '(' + str + ')'
          + '[ ,\n]'

        , 'g'
      );

      var arr;
      var countriesFound = [];

      while ((arr = regex.exec(text)) !== null) {
        countriesFound.push({
          "value": arr[1],
          "index": regex.lastIndex - arr[0].length + 1
        });
      }

      callback(null, str, countriesFound);

    });
  });
};
