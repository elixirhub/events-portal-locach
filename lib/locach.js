var htmlparser = require('htmlparser2');
var he = require('he');
var XRegExp = require('xregexp').XRegExp;

var lib = {
  indexes: require('./indexes.js'),
  vocab: require('./vocab.js'),
  inspect: {
    type1: require('./inspect/type1.js')
  }
};

/**
 * @param {String} html
 * @param {Function} callback
 *
 * @returns {Object} Locations found.
 */

module.exports = function (html, callback) {

  var locations = [];
  var text = '';

  var bool = true; // used for ignoring scripts

  var parser = new htmlparser.Parser({
    "onopentag": function (name, attribs) {
      if (name === 'script') bool = false;
    },
    "ontext": function (chunk) {
      if (bool) text += ' ' + chunk;
    },
    "onclosetag": function (tagname) {
      if (tagname === 'script') bool = true;
    }
  }, {
    normalizeWhitespace: true
  });

  parser.write(html);
  parser.end();

  text = he.decode(text);
  text = text.replace(XRegExp('[\\p{C}\\p{Z}]{2,}', 'g'), ' ');
  console.log(text);

  // ensuring indexes
  lib.indexes(function (err) {
    if (err) return callback(err);

    // setup vocab
    lib.vocab.setup(function (err) {
      if (err) return callback(err);

      lib.inspect.type1(text, function (err, result) {
        if (err) return callback(err);

        console.log('result:', result);

     });
    });
  });

};
