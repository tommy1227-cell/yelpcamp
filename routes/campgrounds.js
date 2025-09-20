const express = require('express');
const router =express.Router();
const ExpressError = require('../utils/ExpressError.js');
const Campground = require('../models/campground.js');
const { campgroundSchema, reviewSchema } = require('../schemas');
const catchAsync = require('../utils/catchAsync.js');
const campground = require('../models/campground.js');
const {isLoggedIn} = require('../middleware')

const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(detail => detail.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}


router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

router.get('/new',isLoggedIn, (req, res) => {
    res.render('campgrounds/new.ejs',)
})

router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
     if(!campground){
        req.flash('error','キャンプ場が見つかりませんでした')
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}));


router.get('/:id/edit',isLoggedIn, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

router.post('/',isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('不正なキャンプデータです', 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', '新しいキャンプ場を登録しました。')
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.put('/:id',isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    req.flash('success','更新完了')
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:id',isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success','削除完了')
    res.redirect('/campgrounds')
}));

module.exports = router;
