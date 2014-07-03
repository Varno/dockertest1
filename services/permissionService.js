var _ = require('underscore'),
    util = require('util'),
    path = require('path'),
    async = require('async'),
    config = require('config'),
    validator = require('validator'),
    UserService = require('../services/userService');

var getLoginUrl = function (req, defaultRoute) {
    defaultRoute = defaultRoute || '/login';
    return defaultRoute + '?redirectUrl=' + req.url;
}

var updateReturnUrl = function (req) {
    req.session.redirectUrl = req.url;
}

exports.check = function (functions) {
    return function (req, res, next) {
        UserService.getById(req.user._id, function (err, user) {
            if (err) return next(err);
            var functionSeries =
                _.chain(functions)
                    .flatten()
                    .map(
                        function (item) {
                            return function (_callback) {
                                item(user, req, res, _callback);
                            }
                    })
                    .value();

            async.series(functionSeries, function (err) {
                if(err instanceof  GLOBAL.PermissionDeniedError) err = null;
                next(err);
            });
        })
    };
}

exports.ajaxCompleteStatusOnly = function (user, req, res, callback) {
    var err = !user.isComplete() ? new GLOBAL.PermissionDeniedError() : null;
    if (err) return res.status(403).send({redirectUrl: '/auth/complete'});
    callback(err);
}

exports.activatedOnly = function (user, req, res, callback) {
    var err = !user.isActivated() ? new GLOBAL.PermissionDeniedError() : null;
    if (err) return res.status(403).send({ message: 'Account not activated' });
    callback(err);
}

exports.completeStatusOnly = function (user, req, res, callback) {
    var err = !user.isComplete() ? new GLOBAL.PermissionDeniedError() : null;
    if(err){
        // Store current url as returnUrl
        req.session.redirectUrl = req.originalUrl;
        return res.redirect('/auth/complete');
    }

    callback(err);
}

exports.paidOnly = function (user, req, res, callback) {
    var eventId = req.params.id || req.query.id || req.body.id;
}

exports.ajaxWorkerOnly = function (req, res, next) {
    var token = req.body.accessToken || req.params.accessToken || req.query.accessToken;
    if (token == config.app.workerAccessToken) return next();
    res.status(403).send({message: 'Access token is not valid'});
}

exports.authorizedOnly = function (defaultRoute) {
    return function (req, res, next) {
        if (req.isAuthenticated()) return next();
        updateReturnUrl(req);
        res.redirect(getLoginUrl(req, defaultRoute));
    };
}

exports.ajaxAuthorizedOnly = function (defaultRoute) {
    return function (req, res, next) {
        console.log(req.url);
        console.log(req.isAuthenticated());
        if (req.isAuthenticated()) return next();
        updateReturnUrl(req);
        res.status(403).send({redirectUrl: getLoginUrl(req, defaultRoute)});
    };
}

exports.authorized = function (req, res, next) {
    return function (err, user, info) {
        var redirectUrl = '/';

        if (err) {
            return next(err);
        }

        // Check user valid for current invite
        //var invite = EventSessionService.tryGetCurrentInvite(req);
        //if (invite && invite.socialUserWithDifferentEmailAlreadyExists)
        //    return res.redirect(SpeakerSessionInviteRoutes.templates.accept.replace(':token', invite.requestToken));

        if (!user) {
            return res.redirect('/');
        }

        // If we have previously stored a redirectUrl, use that,
        // otherwise, use the default.
        if (req.session.redirectUrl) {
            redirectUrl = req.session.redirectUrl;
            req.session.redirectUrl = null;
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
        });
        res.redirect(redirectUrl);
    }
};