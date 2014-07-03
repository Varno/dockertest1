var passport = require('passport'),
    UserService = require('../../services/userService'),
    local = require('./passport-local').init,
    rememberMe = require('./passport-remember-me').init;

exports.init = function () {
    local();
    rememberMe();

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        UserService.getById(user._id, done);
    });
};