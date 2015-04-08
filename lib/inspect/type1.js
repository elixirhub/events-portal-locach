var XRegExp = require('xregexp').XRegExp;

var mongo = require('mongodb-singleton')(
  null,
  null,
  'geonames',
  ['countryInfo', 'allCountries', 'cities15000']
);

var lib = {
  vocab: require('../vocab.js')
};


module.exports = function (text, callback) {

  var locationsFound = [];
  var countriesFound = [];

  var regCountry = XRegExp(
      '\\p{Z}'
    + '('
      + lib.vocab.regCountriesStr.countriesNames
      + lib.vocab.regCountriesStr.ISOs3
      + lib.vocab.regCountriesStr.ISOs
      + lib.vocab.regCountriesStr.fips
    + ')'
    + '\\p{Z}'
    , 'g'
  );

  var arr, type;

  // getting countries
  while ((arr = regCountry.exec(text)) !== null) {

    // getting type
    if (~lib.vocab.regCountriesArr.countriesNames.indexOf(
      '(?:' + arr[1] + ')')
    )
      type = 'country';

    else if (~lib.vocab.regCountriesArr.ISOs3.indexOf(arr[1]))
      type = 'ISO3';

    else if (~lib.vocab.regCountriesArr.ISOs.indexOf(arr[1]))
      type = 'ISO';

    else
      type = 'fips';

    // pushing location
    locationsFound.push({
      "index": regCountry.lastIndex - arr[0].length + 1,
      "country": arr[1],
      "value": arr[0],
      "type": type
    });

    // adding country for getting info
    if (!~countriesFound.indexOf(arr[1])) countriesFound.push(arr[1]);
  }

  console.log('countriesFound:', countriesFound, '\n');

  // getting info of all countries found
  mongo(function (err, collections) {
    if (err) return console.error(err);

    collections.countryInfo.find({
      $or: [
        {country: {$in: countriesFound}},
        {ISO3: {$in: countriesFound}},
        {ISO: {$in: countriesFound}},
        {fips: {$in: countriesFound}}
      ]
    }).toArray(function (err, infoCountries) {
      if (err) return console.error(err);

      console.log('infoCountries:', infoCountries, '\n');

      var leftpart, subtext, regex, arr;

      // getting left part
      for (var i = 0; i < locationsFound.length; i++) {

        subtext = text.substring(
          locationsFound[i].index - 100,
          locationsFound[i].index + locationsFound[i].country.length
        );

        regex = XRegExp(
            '(\\p{L}]+)' // left part
          + '[^\\p{L}]+'
          + locationsFound[i].country
          + '$'
          , 'g'
        );

        console.log('>>>>>>>>>> start >>>>>>>>>>>>');
        console.log(JSON.stringify(subtext));
        console.log('>>>>>>>>>> end >>>>>>>>>>>>');

        arr = regex.exec(subtext);
        if (arr)
          console.log('arr[0]',arr[0]);

      }

      callback(null, locationsFound);

    });
  });

};
