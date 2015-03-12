var escapeStringRegExp = require('escape-string-regexp');


module.exports = function (text, citiesFound, countriesFound) {

  if (!citiesFound || !countriesFound) return null;

  var citiesList = [];
  var countriesList = [];
  var i;

  for (i = 0; i < citiesFound.length; i++)
    citiesList.push(escapeStringRegExp(citiesFound[i].value));
  for (i = 0; i < countriesFound.length; i++)
    countriesList.push(escapeStringRegExp(countriesFound[i].value));

  var regex = new RegExp(
      '\\W'
    + '(' + citiesList.join('|') + ')'
    + '\\W{1,5}'
    + '(' + countriesList.join('|') + ')'
    , 'g'
  );

  var arr;
  var ccFound = [];

  while ((arr = regex.exec(text)) !== null) {
    ccFound.push({
      "value": arr[0].substr(1),
      "index": regex.lastIndex - arr[0].length + 1 // \\W
    });
  }

  return ccFound;

};
