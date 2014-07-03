/**
 * Created by ASUS on 07.04.2014.
 */
var stripe = require('../services/stripeService'),
    config = require('config'),
    _ = require('underscore'),
    userService = require('../services/userService'),
    statsService = require('../services/statsService');

exports.index = function (req, res) {
    var userId = req.user._id;
    userService.getCurrentPlan(userId, function(err, user){
        if(err)
            return res.send(500);
        if(!user)
            return res.send(404);
        res.render('tariffs/index', {
            stripeKey: config.app.stripe.publicKey,
            activePlan: user.activePlan,
            isPhoneActivated: user.activatedPhone || false,
            isEmailActivated: user.activatedEmail || false,
            firstName: user.firstName,
            lastName: user.lastName,
            email: config.app.imageResizerEmails.support,
            currentUser: req.user,
            menu: req.menu
        });
    });
};

function displayVolume(volume) {
    if (typeof volume != "number") return volume;
    var measures = [ "B", "KB", "MB", "GB" ];
    for (var i = 0; i < measures.length; i++) {
        if (volume < 1024)
            return volume.toString() + " " + measures[i];
        volume /= 1024;
    }
}

function displayNumericAcronym(value) {
    if (typeof value != "number") return value;
    var measures = [ "", "thousand", "million" ];
    for (var i = 0; i < measures.length; i++) {
        if (value < 1000)
            return value.toString() + " " + measures[i];
        value /= 1000;
    }
}

function displayTariffValue(value, type) {
    switch (type) {
        case "volume":
            return displayVolume(value);
        case "numericAcronym":
            return displayNumericAcronym(value);
        default:
            return value;
    }
}

exports.getTariffs = function(req, res){
    if(!req.user)
        return res.send({statusCode: 404});
    var tariffs = _.map(config.app.tariffs, function(tariff){
        var clone = JSON.parse(JSON.stringify(tariff));
        delete clone.stripePlanName;
        clone.displayLimits = [];
        var pairs = _.pairs(clone.limits);
        for(var i in pairs){
            var pair = pairs[i],
                displayLimitName = pair[0],
                limitValue = pair[1].limit,
                limitPeriod = pair[1].period,
                limitDisplayType = pair[1].displayType;
            clone.displayLimits.push({
                name: displayLimitName,
                value: displayTariffValue(limitValue, limitDisplayType),
                period: limitPeriod
            });
        }
        clone.displayPrice = clone.price ? '$' + (clone.price / 100) : 'Free';
        delete clone.limits;
        return clone;
    });
    res.send(tariffs);
};

exports.subscribe = function (req, res) {
    var token = req.body.token,
        userId = req.user._id,
        plan = getPlanByLowercasePlanName(req.body.plan);

    console.log('Got plan from config');
    console.log(plan);

    userService.getStripeId(userId, function(err, user){
        if(err || !user) {
            res.send({ message: 'Cannot subscribe' });
            return;
        }

        function updateSubscriptionCallback(err, subscription){
            if(err) {
                res.send({message: 'Cannot update subscription: stripe error'});
                console.log(err);
            }
            if (subscription) {
                user.startSubscription = subscription.current_period_start;
                user.endSubscription = subscription.current_period_end;
                user.statusSubscription = subscription.status;
            }
            user.activePlan = req.body.plan;
            user.save(function(err){
               if(err){
                   res.send({message: 'Cannot save subscription'});
                   console.log(err);
               }
                statsService.getStats(user._id, function(err, stats){
                    res.send({success: true, activePlan:req.body.plan, subscription:
                    {
                        start: user.startSubscription,
                        end: user.endSubscription,
                        status: user.statusSubscription
                    }, statistics: stats });
                });
            });
        };

        var stripeAccountId = user.getInfo(infoTypeEnum.stripeAccountId);
        stripe.updateSubscription(stripeAccountId, plan.stripePlanName, token, updateSubscriptionCallback);
    });
};

function getPlanByLowercasePlanName(planName){
    var plan = _.where(config.app.tariffs, { nameLowercase: planName })[0];
    return plan;
};

    function upperFirstLetter(input){
        return input.charAt(0).toUpperCase() +  input.substring(1, input.length);
    };