var util = require('util'),
    config = require('config'),
    passreset = require('pass-reset'),
    UserService = require('../services/userService');

exports.get = function (req, res) {
    // Render page with password here
    res.render('password/reset', { token: req.params.token });
}

exports.requestToken = passreset.requestResetToken({
    loginParam: 'email',
    callbackURL: util.format('%s/%s', config.app.domain, config.app.forgotPassword.callbackUrl)
})

exports.rememberUserIdFromToken = function (req, res, next) {
    var token = req.body.token;
    if (!token) return res.send(400, { message: 'Token required' });

    passreset.storage.lookup(token, function(err, id) {
        if (err) return next(err);

        req.session.userIdFromToken = id;
        next();
    });
}

exports.reset = passreset.resetPassword({
    tokenParam: 'token',
    passwordParam: 'password',
    confirmParam: 'confirm',
    next: true
});

exports.returnLoginUrl = function (req, res) {
    var userId = req.session.userIdFromToken;
    if (!userId) return res.send(500, { message: 'User id from token not present' });

    UserService.getById(userId, function(err, user) {
        if (err) return res.send(500, { message: err.message });

        // Clear session
        req.session.userIdFromToken = null;

        res.send({
            loginUrl: '/login'
        });
    });
}
