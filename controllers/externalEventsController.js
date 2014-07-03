var config = require('config'),
    _ = require('underscore'),
    stripeService = require('../services/stripeService'),
    userService = require('../services/userService'),
    proxyService = require('../services/proxyService'),
    stripeEventService = require('../services/stripeEventProcessingService');

exports.processStripeEvent = function(req, res){
    var eventData = req.body;
    stripeEventService.processEvent(eventData, function(err) {
        if (err) {
            res.send(417);
            console.log(err);
            return;
        }
        res.send(200);
    });
};

exports.processPlanDowngradeEvent = function(req, res){
    var payload = req.body,
        stripeAccountId = payload.stripeAccountId,
        tariff = _.find(config.app.tariffs, function(tariff) {
            return tariff.stripePlanName == payload.planName;
        });
    if (!tariff)
        res.send(404, "Tariff not found");
    if (tariff.name == config.app.basicPlanName) {
        userService.findUserByStripeAccountId(stripeAccountId, function(err, user){
            if(err) return callback(err);
            if (!user) return callback(new Error(util.format("Unknown stripe account id: %s", stripeAccountId)));
            var userKey = user.getInfo(infoTypeEnum.userKey);
                proxyService.updateAccountAppPlan(userKey, config.app.basicPlanName, function(err){
                    if(err) return callback(err);
                    userService.updateUserActivePlan(user, config.app.basicPlanName);
                    callback();
                });
        });
    }
    else {
        stripeService.updateSubscription(payload.stripeAccountId, payload.planName, payload.token, function(err) {
            if (err) return res.send(417, err);
            res.send(200);
        });
    }
};