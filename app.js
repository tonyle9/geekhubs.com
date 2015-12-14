var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var i18n = require('i18n');
var browserify = require('browserify-middleware')
var methodOverride = require('method-override')
var moment = require('moment')

var app = express();

// minimal config
i18n.configure({
  defaultLocale: 'en',
  locales: ['en'],
  directory: __dirname+'/locales'
});

app.use(methodOverride('_method'))

// init i18n module for this loop
app.use(i18n.init);


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(require('./config/stylus'))
app.use(express.static(path.join(__dirname, 'public')));
app.get('/js/app.js', browserify(path.join(__dirname, 'assets/js/app.js')))

// view helpers
app.use((req, res, next) => {
  res.locals.moment = moment
  next()
})

app.use('/', require('./routes/index'))
app.use('/articles', require('./routes/articles'))
app.use('/comments', require('./routes/comments'))
app.use('/tags', require('./routes/tags'))
app.use('/users', require('./routes/users'))

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
