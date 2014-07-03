var _ = require('underscore'),
    util = require('util'),
    config = require('config'),
    validator = require('validator'),
    UserService = require('../services/userService'),
    StatsService = require('../services/statsService'),
    TwilioService = require('../services/twilioService');

exports.index = function (req, res) {
    res.render('dashboard/index', {
        currentUser: req.user,
        menu: req.menu
    });
}
var getCompanyAndPosition = function (user) {
    var parts = [];
    parts.push(user.getInfo(GLOBAL.infoTypeEnum.position));
    parts.push(user.getInfo(GLOBAL.infoTypeEnum.company));
    parts = _.filter(parts, function (item) {
        return item && item.trim().length > 0;
    });

    return parts.join(' of ');
}

var getProfileImageTitle = function (user) {
    var parts = [];
    parts.push(user.fullName());
    parts.push(user.getInfo(GLOBAL.infoTypeEnum.position));
    parts.push(user.getInfo(GLOBAL.infoTypeEnum.company));
    parts = _.filter(parts, function (item) {
        return item && item.trim().length > 0;
    });

    return parts.join(' ');
}

exports.emailMeAgain = function (req, res) {
    UserService.generateActivationTokenAndSendToUser(req.user, function (err) {
        if (err) return res.send(500, {message: err.message});
        res.send(200, {message: "Activation email has been sent successfully."});
    })
}

exports.callMeAgain = function (req, res) {
    var user = req.user,
        phone = _.where(user.info, { type: infoTypeEnum.phone })[0];
    console.log('phone number');
    console.log(phone);
    TwilioService.call(phone, user._id, user.phoneActivationToken, function (err) {
        if (err) {
            console.log(util.format('Cannot make call for user: %s with code: %s', user._id, user.phoneActivationToken));
            console.log(err);
            return res.send(500, {message: err.message});
        }
        res.send(200, {message: "Please, enter your activation code below"});
    });
};

exports.get = function (req, res) {
    UserService.getById(req.user._id, function (err, user) {
        if (err) return res.send(500, { message: err.message });

        var result = user.toJson();
        result.fullName = user.fullName();
        result.profileImageTitle = getProfileImageTitle(user);
        res.send(result);
    });
}

exports.getUserKey = function (req, res) {
    var userId = req.user._id;
    UserService.getUserKey(userId, function (err, userKey) {
        if (err) return res.send(500, { message: err.message });
        res.send(userKey);
    });
};


exports.update = function (req, res) {
    UserService.updateProfile(req.user, req.body, function (err, user, validation) {
        if (err) return res.send(500, { message: err.message });
        if (validation) return res.send(400, { message: 'Validation error', errors: validation });

        res.send(user.toJson());
    });
}

exports.sendMessage = function (req, res) {
    UserService.sendMessage(req.user, req.body.userId, req.body.message, function (err) {
        if (err) return res.send(500, { message: err.message });
        res.send();
    })
}

exports.getPixels = function (req, res) {
    var userId = req.user._id;
    StatsService.getStats(userId, function (err, pixels) {
        var response = err ? { success: false, message: err.message, statistics: null } : pixels;
        console.log('stats');
        res.send(response);
    });
};

exports.getDetails = function (req, res) {
    var userId = req.user._id;
    UserService.getUserDetails(userId, function (err, user) {
        err ? res.send(500, { success: false, user: null, status: 500 }) : res.send(user);
    });
};

exports.getStatistics = function (req, res) {
    var userId = req.user._id;
    StatsService.getStatistics(userId, function (err, data){
        err ? res.send(500, { success: false, statistics: null, status: 500 }) : res.send(data);
    });
};