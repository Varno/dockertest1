var util = require('util'),
    config = require('config'),
    UserService = require('../services/userService'),
    TwilioService = require('../services/twilioService');

exports.activateEmail = function (req, res, next) {
    var token = req.params.token;
    if (!token) return next({ statusCode: 404 });
    UserService.getByActivationToken(token, function (err, user) {
        if (err) return next(err);
        if (!user) return next({ statusCode: 404 });
        user.activateEmail(function(err){
            if(err){
                console.log(util.format('Cannot activate email: user: %s and token: %s', user._id, token));
                console.log(err);
                return res.send(500, { success: false });
            }
            res.redirect('/dashboard#?activated&email');
        });
    });
}

exports.activatePhone = function(req, res, next){
    var userId = req.user._id,
        activationToken = req.body.token;
    UserService.getByIdAndPhoneToken(userId, activationToken, function(err, user){
        if(err){
            console.log(util.format('cannot get user by id: %s and token: %s', userId, activationToken));
            console.log(err);
            return next(err);
        }
        if(!user){
            return next({ statusCode: 404 });
        }
        UserService.createExternalAccountsAndUpdateProfile(user, function(err){
            if(err) return next();
            user.activatePhone(function (err) {
                if (err) return next(err);
                // Login user and show activation message
                req.logIn(user, function(err) {
                    if (err){
                        return next(err);
                    }
                    res.redirect('/dashboard#?activated');
                });
            });
        });
    });
};

exports.twiMl = function(req, res){
    var userId = req.params.userId,
        activationToken = req.params.token;
    UserService.getByIdAndPhoneToken(userId, activationToken, function(err, user){
        if(err){
            console.log(util.format('cannot get user by id: %s and token: %s', userId, activationToken));
            console.log(err);
            return res.send(404);
        }
        if(!user){
            return res.send(404);
        }
        //if found, will be the only user, because there is _id in query
        var  xml = TwilioService.callTwiMl(activationToken);
        res.header('Content-Type','text/xml').send(xml);
    })
};