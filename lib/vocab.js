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

      var regCountriesArr = {
        ISOs: [],
        ISOs3: [],
        countriesNames: [],
        fips: []
      };

      for (var i = 0; i < countryInfoDocs.length; i++) {
        if (countryInfoDocs[i].ISO)
          regCountriesArr.ISOs.push(countryInfoDocs[i].ISO);
        if (countryInfoDocs[i].ISO3)
          regCountriesArr.ISOs3.push(countryInfoDocs[i].ISO3);
        if (countryInfoDocs[i].country)
          regCountriesArr.countriesNames.push(
            '(?:' + countryInfoDocs[i].country + ')'
          );
        if (countryInfoDocs[i].fips)
          regCountriesArr.fips.push(countryInfoDocs[i].fips);
      }

      var regCountriesStr = {};

      regCountriesStr.ISOs = regCountriesArr.ISOs.join('|');
      regCountriesStr.ISOs3 = regCountriesArr.ISOs3.join('|');
      regCountriesStr.countriesNames =
        regCountriesArr.countriesNames.join('|');
      regCountriesStr.fips = regCountriesArr.fips.join('|');

      exports.regCountriesArr = regCountriesArr;
      exports.regCountriesStr = regCountriesStr;
      setupDone = true;
      callback();

    });
  });

};
