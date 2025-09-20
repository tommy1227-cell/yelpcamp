const express = require('express');
const router = express.Router({ mergeParams: true });
const User = require('../models/user');
const { storeReturnTo } = require('../middleware');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync.js');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) return next(err);
            // ログイン状態の保持のため
            req.flash('success', 'Yelpcampへようこそ');
            res.redirect('/campgrounds');
        })

    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }

});

router.get('/login', (req, res) => {
    res.render('users/login')
});

// passport.autenticate(カスタム) ログインを勝手にしてくれる。
router.post('/login',storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'おかえりなさい');
    const redirectUrl = res.locals.returnTo
    res.redirect(redirectUrl);
});

router.get('/logout', (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err)
        }
        req.flash('success', 'ログアウトしました');
        res.redirect('/campgrounds');
    });

});

module.exports = router;