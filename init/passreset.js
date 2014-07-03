var util = require('util'),
    config = require('config'),
    passreset = require('pass-reset'),
    User = require('../models/user'),
    UserService = require('../services/userService'),
    EmailService = require('../services/emailService');

exports.init = function () {

    passreset.expireTimeout(config.app.forgotPassword.expireTimeoutInHours, 'hours');

    // Configure the user lookup routine
    passreset.lookupUsers(function (email, callback) {
        User.find({ email: email, password: {'$ne': null } }, function (err, users) {
            if (err) return callback(err);
            if (!users.length) return callback(null, false);

            var user = users[0];
            callback(null, {
                email: user.email,
                users: [
                    {
                        id: user.id,
                        name: util.format('%s %s', user.firstName, user.lastName)
                    }
                ]
            });
        });
    });

    // Configure the set password routine
    passreset.setPassword(function (id, password, callback) {
        if (!password || password.length == 0)
            return callback(null, false, 'New password required');

        if (password && password.length < config.app.forgotPassword.minPasswordLength)
            return callback(null, false, util.format('Password must be at least %d characters',
                config.app.forgotPassword.minPasswordLength));

        UserService.getById(id, function (err, user) {
            if (err) return callback(err);
            if (!user) return callback({message: "User not found"});

            user.setPassword(password, function () {
                user.save(function (err) {
                    callback(err, true);
                });
            });
        });
    });

    // Configure the send email routine
    passreset.sendEmail(function (email, requests, callback) {
        var request = requests[0];
        EmailService.send(
            email,
            config.app.emailTemplates.passwordReset,
            {
                to: email,
                first_name: request.name,
                reset_url: request.url // Since email is unique for application
            }, function (err) {
                callback(err, true);
            });
    });

    passreset.storage.setStore({
        create: function(id, token, callback) {
            UserService.createPassResetToken(id, token, callback);
        },
        lookup: function(token, callback) {
            UserService.lookupByPassResetToken(token, callback);
        },
        destroy: function(token, callback) {
            UserService.destroyPassResetToken(token, callback);
        }
    });
}