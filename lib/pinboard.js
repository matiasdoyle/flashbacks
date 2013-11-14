var request = require('request');

function Pinboard(options) {
  // TODO: Extend
  this.options = options || {
    auth: Pinboard.AUTH_TOKEN
  };

  var base = Pinboard.BASE_URL;

  this.url = {
    base: base,
    posts: {
      update: base + '/posts/update',
      'delete': base + '/posts/delete',
      get: base + '/posts/get',
      dates: base + '/posts/dates',
      recent: base + '/posts/recent',
      all: base + '/posts/all',
      suggest: base + '/posts/suggest',
    },
    tags: {
      get: base + '/tags/get',
      'delete': base + '/tags/delete',
      rename: base + '/tags/rename'
    },
    user: {
      secret: base + '/user/secret',
      api_token: base + '/user/api_token'
    },
    notes: {
      list: 'notes/list',
      id: 'notes/ID'
    }
  };
}

Pinboard.BASE_URL = 'https://api.pinboard.in/v1';
Pinboard.AUTH_PASSWORD = 'password';
Pinboard.AUTH_TOKEN = 'token';

Pinboard.prototype.get = function(token, options, callback) {
  if (typeof options == 'function') {
    callback = options;
    options = {};
  }

  if (!this._validateToken(token)) return callback(new TypeError('Token not valid'), null);

  options.dt = this._findDateProperty(options);

  this._req(this.url.posts.get, token, options, function(err, body) {
    if (err) return callback(err, null); // TODO: Error handling

    callback(null, body);
  });
};

Pinboard.prototype._req = function(url, token, params, callback) {
  var self = this;
  var options = {
    qs: params,
    json: true
  };

  options.qs.auth_token = token;
  options.qs.format = 'json';

  request(url, options, function(err, res) {
    if (err) return callback(err, null); // TODO: Error handling

    // TODO: check status code

    callback(null, self._parse(res.body));
  });
};

Pinboard.prototype._parse = function(body) {
  if (body.date) body.date = new Date(body.date);
  if (body.posts && Array.isArray(body.posts)) {
    body.posts = this._createDates(body.posts);
  }

  return body;
};

Pinboard.prototype._createDates = function(arr) {
  for (var i=0; i<arr.length; i++) {
    if (arr[i].time) arr[i].time = new Date(arr[i].time);
  }

  return arr;
};

Pinboard.prototype._findDateProperty = function(options) {
  return options.date || options.dt;
};

Pinboard.prototype._validateToken = function(token) {
  return Array.isArray(token.match(':'));
};

module.exports = Pinboard;
