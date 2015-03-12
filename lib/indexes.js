var mongo = require('mongodb-singleton')(
  null,
  null,
  'geonames',
  ['countryInfo', 'allCountries', 'cities15000']
);


module.exports = function (callback) {

  mongo(function (err, collections) {
    if (err) return callback(err);

    collections.countryInfo.ensureIndex({
      "ISO": 1,
      "ISO3": 1,
      "country": 1,
      "fips": 1
    }, function (err) {
      if (err) return callback(err);

      collections.allCountries.ensureIndex({
        "countryCode": 1
      }, function (err) {
        if (err) return callback(err);

        callback(null);

      });
    });
  });

};
