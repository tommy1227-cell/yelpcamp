const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const ExpressError = require('./utils/ExpressError.js')
const Campground = require('./models/campground.js');
const catchAsync = require('./utils/catchAsync');
const morgan = require('morgan');
const ejsMate = require('ejs-mate');
const { campgroundSchema } = require('./schemas');

mongoose.connect('mongodb://127.0.0.1:27017/yelpcamp')
    .then(() => {
        console.log('接続しています')
    })
    .catch(err => {
        console.log('接続できていません')
    });

app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, 'views')); //getでテンプレートはviewsから探してください
app.set('view engine', 'ejs'); //ejsを使って書く宣言

//ミドルウェア（ログイン認証とかにも使える）
app.use(express.urlencoded({ extended: true })); //データをとってくるときに必要
app.use(methodOverride('_method')); //get post以外のformのHTTPメソッドの時に必要
app.use((req, res, next) => {
    console.log('ミドルウェアを通過');
    next(); //ここで止めないためのもの
});//ミドルウェアの通過の確認
app.use(morgan('tiny')); //ログ管理

const validateCampground = (req, res, next) => {

    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(detail => detail.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
    console.log(result);
}

app.get('/', (req, res) => {
    res.render('home.ejs');
});

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new.ejs',)
})

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
}));

app.get('/practice', (req, res) => {
    res.send('接続確認');
});

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}));

app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('不正なキャンプデータです', 400);

    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds')
}));

app.use((req, res, next) => {
    next(new ExpressError('ページが見つかりません', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, } = err;
    if (!err.message) {
        err.message = '問題が起きました'
    }
    res.status(statusCode).render('error', { err })
});

app.listen(3000, () => {
    console.log('接続中');
});
