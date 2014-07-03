var config = require('config'),
    crypto = require('crypto'),
    passport = require('passport'),
    RememberMeStrategy = require('passport-remember-me').Strategy,
    UserService = require('../../services/userService');

exports.init = function () {
    passport.use(new RememberMeStrategy({
            key: config.app.rememberPassword.cookieName
        },
        function (token, done) {
            UserService.getByToken(token, function (error, user) {
                if (error) {
                    done(error);
                } else if (!user) {
                    done(null, false);
                } else {
                    // Invalidate token for security purposes ...
                    user.clearAutoLoginToken(function(err, user) {
                        done(null, user);
                    });
                }
            });
        }, function (user, done) {
            // ... and create new token
            user.generateAutoLoginToken(function(err, user) {
                done(err, user.autoLoginHash);
            });
        }));
};