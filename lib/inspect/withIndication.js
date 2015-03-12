var XRegExp = require('xregexp').XRegExp;

var lib = {
  vocab: require('../vocab.js')
};


module.exports = function (text, callback) {

  var regex = XRegExp(

      '(?:'

      // sep (unicode support)
      + '([^\\p{L}\\p{N}])'

      // indication (case insensitive)
      + '(' + lib.vocab.indications.join('|') + ')'

      // sep (unicode support)
      + '('
        + '(?::){0,1}'
        + '(?:&nbsp;){0,1}'
        + '[^.\\p{L}\\p{N}]+'
        + '(?:the){0,1}'
        + '[^\\p{L}\\p{N}]*'
      + ')'

    + ')'

    // location
    + '('
      + '[A-Z]' // start with an upper case
      + '[^\\[\\]():]+?' // any character (non-greedy)
    + ')'

    // end 1
    + '(' + lib.vocab.regCountriesInfo.countriesNames + '){1}'

    /*
    // end 2
    + '('
        + '(?:'
          + lib.vocab.regCountriesInfo.ISOs
          + lib.vocab.regCountriesInfo.ISO3s
          + lib.vocab.regCountriesInfo.fips
        + ')'
        + '|'
        + '(?: and )'
        + '|'
        + '(?: in \\p{N})'
    + '){0,1}'
    */

    /*
    // end
    + '('
        + '(?:' + countriesListRegex + ')'
        + '|'
        + '(?: and )'
        + '|'
        + '(?: in \\p{N})'
    + ')'
    */


    , 'g'
  );

  var arr;
  var locationsFound = [];

  while ((arr = regex.exec(text)) !== null) {
    locationsFound.push({
      "sep preceding:": arr[1],
      "indication:": arr[2],
      "sep following:": arr[3],
      "location:": arr[4],
      "end:": arr[5],
      //"value": (arr[2] + (arr[3] || '')).replace(/\s+/g, ' '),
      //"index": regex.lastIndex - arr[0].length + arr[1].length
    });
  }

  callback(null, locationsFound);

};
