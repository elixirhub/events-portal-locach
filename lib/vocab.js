var mongo = require('mongodb-singleton')(
  null,
  null,
  'geonames',
  ['countryInfo', 'allCountries', 'cities15000']
);


var setupDone = false;


exports.indications = [
  '(?:[iI][nN])',
  '(?:[aA][tT])',
  '(?:[vV][eE][nN][uU][eE])',
  '(?:[lL][oO][cC][aA][tT][iI][oO][nN])'
];


exports.setup = function (callback) {

  if (setupDone) return callback();

  mongo(function (err, collections) {
    if (err) return callback(err);

    collections.countryInfo.find({}).toArray(function (err, countryInfoDocs) {
      if (err) return callback(err);

      var regCountriesInfo = {
        ISOs: [],
        ISOs3: [],
        countriesNames: [],
        fips: []
      };

      for (var i = 0; i < countryInfoDocs.length; i++) {
        if (countryInfoDocs[i].ISO)
          regCountriesInfo.ISOs.push(countryInfoDocs[i].ISO);
        if (countryInfoDocs[i].ISO3)
          regCountriesInfo.ISOs3.push(countryInfoDocs[i].ISO3);
        if (countryInfoDocs[i].country)
          regCountriesInfo.countriesNames.push(
            '(?:' + countryInfoDocs[i].country + ')'
          );
        if (countryInfoDocs[i].fips)
          regCountriesInfo.fips.push(countryInfoDocs[i].fips);
      }

      regCountriesInfo.ISOs = regCountriesInfo.ISOs.join('|');
      regCountriesInfo.ISOs3 = regCountriesInfo.ISOs3.join('|');
      regCountriesInfo.countriesNames =
        regCountriesInfo.countriesNames.join('|');
      regCountriesInfo.fips = regCountriesInfo.fips.join('|');

      exports.regCountriesInfo = regCountriesInfo;
      setupDone = true;
      callback();

    });
  });

};
