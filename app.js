const express = require('express');
const ejsLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const app = express();

// import passport config
require('./config/passport')(passport);

// import db config
const db = require('./config/keys').MongoURI;

// connect to Mongo
mongoose.connect(db, { useNewUrlParser: true })
	.then(() => console.log('MongoDB CONNECTED...'))
	.catch(err => console.log(err));

// EJS middleware
app.use(ejsLayouts);
app.set('view engine', 'ejs');

// body parser middleware
app.use(express.urlencoded({ extended: false }));

// session middleware
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// connect flash middleware
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log(`SERVER STARTED ON PORT ${PORT}`);
});
