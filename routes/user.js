const express = require('express');
const router = express.Router();
const csrf = require('csurf');
let passport = require('passport');
let LocalStrategy = require('passport-local').Strategy;
const Product = require('../models/product');
const Order = require('../models/order');
const Cart = require('../models/cart');
const User = require('../models/user');
const middleware = require('../middleware');
const {
	userSignUpValidationRules,
	userSignInValidationRules,
	validateSignup,
	validateSignin,
} = require('../config/validator');
const csrfProtection = csrf();
router.use(csrfProtection);

// GET: display the signup form with csrf token
router.get('/signup', middleware.isNotLoggedIn, (req, res) => {
	let errorMsg = req.flash('error')[0];
	res.render('user/signup', {
		csrfToken: req.csrfToken(),
		errorMsg,
		pageName: 'Sign Up',
	});
});
// POST: handle the signup logic
router.post(
	'/signup',
	[
		middleware.isNotLoggedIn,
		userSignUpValidationRules(),
		validateSignup,
		passport.authenticate('local.signup', {
			successRedirect: '/user/profile',
			failureRedirect: '/user/signup',
			failureFlash: true,
		}),
	],
	async (req, res) => {
		try {
			//if there is cart session, save it to the user's cart in db
			if (req.session.cart) {
				const cart = await new Cart(req.session.cart);
				cart.user = req.user._id;
				await cart.save();
			}
			// redirect to the previous URL
			if (req.session.oldUrl) {
				let oldUrl = req.session.oldUrl;
				req.session.oldUrl = null;
				res.redirect(oldUrl);
			} else {
				res.redirect('/user/profile');
			}
		} catch (err) {
			console.log(err);
			req.flash('error', err.message);
			return res.redirect('/');
		}
	}
);

// GET: display the signin form with csrf token
router.get('/signin', middleware.isNotLoggedIn, async (req, res) => {
	let errorMsg = req.flash('error')[0];
	res.render('user/signin', {
		csrfToken: req.csrfToken(),
		errorMsg,
		pageName: 'Sign In',
	});
});

// POST: handle the signin logic
router.post(
	'/signin',
	[
		middleware.isNotLoggedIn,
		userSignInValidationRules(),
		validateSignin,
		passport.authenticate('local.signin', {
			failureRedirect: '/user/signin',
			failureFlash: true,
		}),
	],
	async (req, res) => {
		try {
			// cart logic when the user logs in
			let cart = await Cart.findOne({user: req.user._id});
			// if there is a cart session and user has no cart, save it to the user's cart in db
			if (req.session.cart && !cart) {
				const cart = await new Cart(req.session.cart);
				cart.user = req.user._id;
				await cart.save();
			}
			// if user has a cart in db, load it to session
			if (cart) {
				req.session.cart = cart;
			}
			// redirect to old URL before signing in
			if (req.session.oldUrl) {
				let oldUrl = req.session.oldUrl;
				req.session.oldUrl = null;
				res.redirect(oldUrl);
			} else {
				res.redirect('/user/profile');
			}
		} catch (err) {
			console.log(err);
			req.flash('error', err.message);
			return res.redirect('/');
		}
	}
);

// GET: display user's profile
router.get('/profile', middleware.isLoggedIn, async (req, res) => {
	const successMsg = req.flash('success')[0];
	const errorMsg = req.flash('error')[0];
	try {
		// find all orders of this user
		allOrders = await Order.find({user: req.user});
		res.render('user/profile', {
			orders: allOrders,
			errorMsg,
			successMsg,
			pageName: 'User Profile',
		});
	} catch (err) {
		console.log(err);
		return res.redirect('/');
	}
});

// GET: display user's edit profile form
router.get('/edit-profile', middleware.isLoggedIn, async (req, res) => {
	const successMsg = req.flash('success')[0];
	const errorMsg = req.flash('error')[0];
	try {
		// find all information of this user
    const user = await User.findById(req.user._id);
    res.render('user/edit-profile', {
      user,
      errorMsg,
      successMsg,
      pageName: 'Edit Profile',
    });
	} catch (err) {
		console.log(err);
		return res.redirect('/');
	}
});
// PUT: handle the edit profile logic
router.put('/edit-profile', middleware.isLoggedIn, async (req, res) => {
  try {
    // find the user and update the information
    const user
    = await User.findById(req.user._id);
    user.username = req.body.username;
    user.email = req.body.email;
    user.address = req.body.address;
    user.phone = req.body.phone;
    await user.save();
    req.flash('success', 'Successfully updated your profile!');
    res.redirect('/user/edit-profile');
  } catch (err) {
    console.log(err);
    req.flash('error', err.message);
    return res.redirect('/user/edit-profile');
  }
});
// GET: logout
router.get('/logout', middleware.isLoggedIn, (req, res) => {
	req.logout();
	req.session.cart = null;
	res.redirect('/');
});
module.exports = router;
