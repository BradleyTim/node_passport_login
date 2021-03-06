const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport =require('passport');

// import User model
const User = require('../models/User');

// login route
router.get('/login', (req, res) => res.render('login'));

// register route
router.get('/register', (req, res) => res.render('register'));

// register handler
router.post('/register', (req, res) => {
	//console.log(req.body);
	const { name, email, password, password2 } = req.body;
	let errors =[];

	if(!name || !email || !password || !password2) {
		errors.push({ msg: 'Please fill in all fields' })
	}

	if(password !== password2) {
		errors.push({ msg: 'Passwords do not match' })
	}

	if(password.length < 6) {
		errors.push({ msg: 'password should be at least 6 characters' })
	}

	if(errors.length > 0) {
		// render errors
		res.render('register', { errors, name, email, password, password2});
	} else {
		// if validation passes!
		User.findOne({ email: email})
			.then(user => {
				if(user) {
					errors.push({ msg: 'Email is already registered' })
					res.render('register', { errors, name, email, password, password2});
				} else {
					const newUser = new User({
						name,
						email,
						password
					});

					// hash password
					bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
						if(err) throw err;
						//set password to hash
						newUser.password = hash;

						//save new user
						newUser.save()
							.then(user => {
								req.flash('success_msg', 'You are now registered and can login');
								res.redirect('/users/login');
							})
							.catch(err => console.log(err));
					}));
				}
			});
	}
});

//login handler
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout handler
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

module.exports = router;
