const express = require('express');
const router = express.Router({ mergeParams: true });
const User = require('../models/user');
const passport = require('passport');
const catchAsync = require('../utils/catchAsync.js');

router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        await User.register(user, password);
        req.flash('success', 'Yelpcampへようこそ');
        res.redirect('/campgrounds');
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('/register')
    }

});

router.get('/login', (req, res) => {
    res.render('users/login')
});
// passport ログインを勝手にしてくれる。
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    req.flash('success', 'おかえりなさい');
    res.redirect('/campgrounds');
})

module.exports = router;