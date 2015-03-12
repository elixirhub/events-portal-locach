var XRegExp = require('xregexp').XRegExp;

var lib = {
  vocab: require('../vocab.js')
};


/**
 * Right to left
 * 1. country to indication
 */

module.exports = function (text, callback) {

  var regexCountries = XRegExp(
      '[^\\p{L}\\p{N}\\[\\]]'

    + '('
      + lib.vocab.regCountriesInfo.countriesNames
      + '|' + lib.vocab.regCountriesInfo.fips
    + ')'

    + '[^\\p{L}\\p{N}\\[\\]]'
    , 'g'
  );

  var regexIndications = XRegExp(
      '[^\\p{L}\\p{N}]'
    + '(' + lib.vocab.indications.join('|') + ')'
    + '[^\\p{L}\\p{N}]'
    , 'g'
  );

  var regexUppercase = XRegExp(

      '^' // start

    + '('
      + '[^\\p{Ll}\\p{N}]*?' // maybe with no lower case and numbers
      + '(?:the)??' // maybe the

      + '[^\\p{Ll}\\p{N}]+?' // no lower case and numbers
    + ')'

    + '\\p{Lu}' // an upper case

    , 'g'
  );

  var countriesFound = [];
  var indicationsFound = [];
  var arr;

  // get all the countries
  while ((arr = regexCountries.exec(text)) !== null) {
    countriesFound.push({
      "index": regexCountries.lastIndex - arr[0].length + 1,
      "country": arr[1]
    });
  }

  // get all the indications
  while ((arr = regexIndications.exec(text)) !== null) {
    indicationsFound.push({
      "index": regexIndications.lastIndex - arr[0].length + 1,
      "indication": arr[1]
    });
  }

  var locationsFound = [];
  var i, j;
  var closestIndication, indexFirstLetter, subtext, text, location;

  var parser;

  // for each countries
  for (i = 0; i < countriesFound.length; i++) {

    closestIndication = null;

    // for each indications
    for (j = 0; j < indicationsFound.length; j++) {

      if (!indicationsFound[j]) continue;

      // if the indication is before the country
      if (indicationsFound[j].index < countriesFound[i].index) {

        // if the indication is after the last indication
        if (closestIndication === null
          || closestIndication.index < indicationsFound[j].index) {

          // set a current indication
          closestIndication = indicationsFound[j];

        }

        // remove the indication
        indicationsFound[j] = null;

      }

    }

    // no closest indication found
    if (!closestIndication)
      continue

    // subtext start at the end of the indication (last no letter included)
    subtext = text.substring(
      closestIndication.index + closestIndication.indication.length + 1,
      countriesFound[i].index + countriesFound[i].country.length
    );

    // first letter
    if ((arr = regexUppercase.exec(subtext)) !== null) {

      indexFirstLetter = regexUppercase.lastIndex - arr[0].length +
        arr[1].length;

      // location is too long
      if (subtext.length - indexFirstLetter > 175) continue;

      text = subtext.substring(indexFirstLetter);
      location = text.replace(XRegExp('\\p{Z}{2,}', 'g'), ' ');
      location = location.replace(XRegExp('\n', 'g'), ',');
      location = location.replace(XRegExp('(?:, ,)|,{2,}', 'g'), ',');
      location = location.replace(XRegExp('(?: ,)', 'g'), ', ');

      locationsFound.push({
        "index": closestIndication.index + closestIndication.indication.length
          + indexFirstLetter,
        "text": text,
        "location": location,
        "indication": closestIndication.indication
      });

    }
  }

  callback(null, locationsFound);

};
