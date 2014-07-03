var _ = require('underscore'),
    config = require('config'),
    passport = require('passport'),
    validator = require('validator'),
    async = require('async'),
    UserService = require('../services/userService');

var logIn = function (req, res, user, next) {
    req.logIn(user, function (err) {
        if (err) return next(err);
        console.log(req.session.redirectUrl);
        return res.redirect(req.session.redirectUrl
            ? req.session.redirectUrl : '/dashboard');
    });
}

exports.login = function (req, res) {
    if (req.query.redirectUrl)
        req.session.redirectUrl = req.query.redirectUrl;
    if(req.isAuthenticated())
        return res.redirect('/dashboard');
    // Invalidate invite
    //EventSessionService.invalidateCurrentInvite(req);
    res.render('auth/index', {
        regUser: null,
        loginUser: null,
        version: config.app.version
    });
}

exports.logout = function (req, res) {
    res.clearCookie('token');
    req.logout();
    res.redirect('/');
}

exports.authenticate = function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
        if (err) return next(err);
        if (!user)
            return res.render(
                'auth/index',
                {
                    loginUser: { email: req.body.email },
                    message: info.message
                }
            );

        if (req.body.rememberMe) {
            user.generateAutoLoginToken(function (err, user) {
                if (err) return next(err);
                res.cookie(config.app.rememberPassword.cookieName, user.autoLoginHash, {
                    path: '/',
                    httpOnly: true,
                    maxAge: config.app.rememberPassword.maxAgeInMilliseconds
                });
                logIn(req, res, user, next);
            });
        } else {
            logIn(req, res, user, next);
        }
    })(req, res, next);
}

exports.createUser = function (req, res) {
    if (!validator.isEmail(req.body.email)
        || validator.isNull(req.body.company)
        || validator.isNull(req.body.firstName)
        || validator.isNull(req.body.lastName)
        || validator.isNull(req.body.postalCode)
        || validator.isNull(req.body.phone)
        || validator.isNull(req.body.password)
        || !validator.isLength(req.body.password, 6))
        return res.redirect('/login');

    UserService.createByEmail({
        email: req.body.email,
        company: req.body.company,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        postalCode: req.body.postalCode,
        domains: req.body.domains,
        phone: req.body.phone,
        password: req.body.password
    }, function (err, user) {
        var message = err ? err.message : null;
        if (err && err.message)
            return res.render('auth/index', {regUser: req.body, message: message});

        UserService.generateActivationTokenAndSendToUser(user, function (err) {
            // No need to wait
            if (err) console.log('Error occured during email activation token generation or sending', err);
            UserService.generatePhoneActivationToken(user, function(err){
                if (err) console.log('Error occured during phone activation token generation', err);
            });
        });

        req.login(user, function () {
            res.redirect(req.session.redirectUrl
                ? req.session.redirectUrl : '/dashboard');
        });
    });
}

exports.complete = function (req, res) {
    //var invite = EventSessionService.tryGetCurrentInvite(req);
    console.log(req.body);
    UserService.getById(req.user._id, function (err, user) {
        var message = err ? err.message : null;
        res.render('auth/complete', {user: user, message: message});
    });
}

exports.completeUser = function (req, res) {
    console.log('incompleteuser');
    console.log(req.body);
    if (!validator.isEmail(req.body.email)
        || validator.isNull(req.body.firstName)
        || validator.isNull(req.body.lastName)
        || validator.isNull(req.body.info.postalCode)
        || validator.isNull(req.body.info.phone)
        || validator.isNull(req.body.info.domains)
        || validator.isNull(req.body.info.company))
        return res.redirect('/auth/complete');

    UserService.updateById(req.user._id, {
        email: req.body.email,
        company: req.body.company,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        info: _.map(req.body.info, function (value, key) {
            return {type: key, value: value}
        })
    }, function (err, user) {
        var message = err ? err.message : null;
        if (err && err.message) {
            return res.render('auth/complete', { user: req.body, message: message });
        }

        UserService.generateActivationTokenAndSendToUser(user, function (err) {
            // No need to wait
            if (err) console.log('Error occured during activation token generation or sending', err);
        });

        var redirectUrl = '/';
        if (req.session.redirectUrl) {
            redirectUrl = req.session.redirectUrl
            req.session.redirectUrl = null;
        }

        res.redirect(redirectUrl);
    });
}