// passportをインストールしていればreq.isAuthenticatedが自動で追加されている。
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; // この行を追加
        req.flash('error', 'ログインしてください')
        return res.redirect('/login');
    }
    next();
} 

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}