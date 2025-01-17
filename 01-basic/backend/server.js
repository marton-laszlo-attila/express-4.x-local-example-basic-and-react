// Fast, unopinionated, minimalist web framework for node.
var express = require('express');
// Simple, unobtrusive authentication for Node.js
var passport = require('passport');
// Simple server side session middleware.
var expressSession = require('express-session');
// HTTP request logger middleware for node.js
var morgan = require('morgan');
// This middleware ensures that a user is logged in.
var connectEnsureLogin = require('connect-ensure-login');
// Assport strategy for authenticating with a username and password.  
// See some another strategy: http://www.passportjs.org/packages
var Strategy = require('passport-local').Strategy;
// Loading database
var db = require('./db');


// Configure the local strategy for use by Passport.
//
// The local strategy require a `verify` function which receives the credentials
// (`username` and `password`) submitted by the user.  The function must verify
// that the password is correct and then invoke `cb` with a user object, which
// will be set at `req.user` in route handlers after authentication.
passport.use(new Strategy(
  function (username, password, cb) {
    db.users.findByUsername(username, function (err, user) {
      if (err) { return cb(err); }
      if (!user) { return cb(null, false); }
      if (user.password != password) { return cb(null, false); }
      return cb(null, user);
    });
  }));


// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  The
// typical implementation of this is as simple as supplying the user ID when
// serializing, and querying the user record by ID from the database when
// deserializing.
passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {
  db.users.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/../frontend/build');
app.set('view engine', 'ejs');

// Use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(morgan('combined'));
// So that the server can receive the form data
app.use(express.urlencoded({ extended: true }));
app.use(expressSession({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Define routes.
app.get('/',
  function (req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function (req, res) {
    res.render('login');
  });

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function (req, res) {
    res.redirect('/');
  });

app.get('/logout',
  function (req, res) {
    req.logout();
    res.redirect('/');
  });

app.get('/profile',
  connectEnsureLogin.ensureLoggedIn(),
  function (req, res) {
    res.render('profile', { user: req.user });
  });

app.listen(8000);
