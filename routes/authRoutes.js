var passport = require('passport'),
    config = require('config'),
    authController = require('../controllers/authController'),
    permissionService = require('../services/permissionService');

module.exports = function (app) {

    app.get('/login', authController.login);
    app.post('/login', authController.authenticate);
    app.get('/logout', authController.logout);

/*    app.get('/auth/facebook', passport.authenticate('facebook', { scope: config.app.social.facebook.scope }));
    app.get('/auth/facebook/callback', function (req, res, next) {
        passport.authenticate('facebook', permissionService.authorized(req, res, next))(req, res, next)
    });

    app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback', function (req, res, next) {
        passport.authenticate('twitter', permissionService.authorized(req, res, next))(req, res, next)
    });

    app.get('/auth/linkedin', passport.authenticate('linkedin'));
    app.get('/auth/linkedin/callback', function (req, res, next) {
        passport.authenticate('linkedin', permissionService.authorized(req, res, next))(req, res, next)
    });*/

    app.post('/auth/email', authController.createUser);

    app.get('/auth/complete', permissionService.authorizedOnly(), authController.complete);
    app.post('/auth/complete', permissionService.authorizedOnly(), authController.completeUser);
    app.get('/auth/complete/reset', permissionService.authorizedOnly(), authController.logout);

}