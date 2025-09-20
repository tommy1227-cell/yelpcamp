const express = require('express');
const app = express();
const path = require('path');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const ExpressError = require('./utils/ExpressError.js');
const catchAsync = require('./utils/catchAsync');
const ejsMate = require('ejs-mate');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const passport =require('passport');
const LocalStrategy =require('passport-local');
const User = require('./models/user.js');
// ルートの追加
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
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
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        // httponlyはセキュリティ上必ずtrueにしておく
        httponly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};
app.use(session(sessionConfig));
// passportのおまじない
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

app.use('/', (req, res, next) => {
    res.locals.currentUser=req.user;
    res.locals.success= req.flash('success');
    res.locals.error = req.flash('error');
    next();
})




app.get('/', (req, res) => {
    res.render('home.ejs');
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);


// app.post('/campgrounds/:id/reviews',catchAsync(async (req, res,) =>{
//     console.log(req.body)
//     res.send('テスト')
// }));



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

