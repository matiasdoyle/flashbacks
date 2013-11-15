// var levelup = require('levelup');
var fs = require('fs');
var path = require('path');
var mandrill = require('mandrill-api/mandrill');
var moment = require('moment');
var handlebars = require('handlebars');
var config = require('./config/config.json');
var Pinboard = require('./lib/pinboard');
var getTemplates = require('./lib/templates');

var pinboard = new Pinboard();
var mandrillClient = new mandrill.Mandrill(config.mandrill);
// var db = levelup('./db/flashback.db');

var templateFiles = {
  html: './template/html.hbs',
  text: './template/text.hbs'
};

var user = config.user;

var nextSend = function(today) {
  var next = moment().hour(8).minute(0).second(0);
  if (!today) next.add('days', 1);

  console.log('Next send in', next.format());
  return next.diff(moment());
};

var setNextSend = function(today) {
  console.log('Setting timeout');
  setTimeout(send, nextSend(today));
};

var send = function() {
  var date = moment()
    .month(moment().month() - 3)
    .format('YYYY-MM-DD');

  console.log('Finding links for', date);

  if (dates[date] === 0) {
    console.log('No links found');
    return setNextSend();
  }

  getTemplates(templateFiles, function(err, templates) {
    if (err) throw err;

    pinboard.get(user.token, { date: date }, function(err, res) {
      if (err) throw err;

      var message = {
        message: {
          subject: 'Links from ' + moment(res.date).format('YYYY-MM-DD'), // TODO: Wrap in function
          html: templates.html(res),
          text: templates.text(res),
          from_email: 'flashbacks@matias.io',
          from_name: 'Flashbacks',
          to: [{
            email: user.email,
            name: user.name,
            type: 'to'
          }]
        },
        async: false
      };

      console.log('Sending email with message', message);
      mandrillClient.messages.send(message, function(result) {
        console.log('Message sent', result);
        setNextSend();
      }, function(err) {
        throw err;
      });
    });
  });
};

// TODO Should save to db..
var dates = {};
pinboard.dates(user.token, function(err, res) {
  if (err) throw err;

  dates = res.dates;

  setNextSend((process.argv.indexOf('--today') > -1));
});
