var fs = require('fs');
var path = require('path');
var handlebars = require('handlebars');

module.exports = function(t, callback) {
  var keys = Object.keys(t);
  var templates = {};
  var key;

  (function loop(i) {
    if (i >= keys.length) return callback(null, templates);

    key = keys[i];

    fs.readFile(t[key], { encoding: 'utf8'}, function(err, text) {
      if (err) return callback(err, null);

      templates[key] = handlebars.compile(text);
      loop(++i);
    });
  })(0);
};
