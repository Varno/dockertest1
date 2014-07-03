var config = require('config'),
    request = require("request"),
    util = require("util"),
    moment = require("moment"),
    User = require('../models/user'),
    proxyService = require('./proxyService'),
    userService = require('./userService'),
    stripe = require('./stripeService.js');

exports.eventTypes = {
    "chargeFailed": "charge.failed",
    "chargeSucceeded": "charge.succeeded",
    "subscriptionCanceled": "customer.subscription.deleted",
    "invoiceCreated": "invoiceitem.created"
};

exports.processEvent = function(eventData, callback){
    switch(eventData.type)
    {
        case exports.eventTypes.subscriptionCanceled:
        case exports.eventTypes.chargeFailed:
            var stripeAccountId = eventData.data.object.customer;
            processSubscriptionCancel(stripeAccountId, callback);
            break;
        case exports.eventTypes.chargeSucceeded:
            var stripeAccountId = eventData.data.object.customer,
                invoiceId = eventData.data.object.invoice;
            console.log('charge succeeded');
            console.log(eventData);
            var stripeAccountId = eventData.data.object.customer;
            if(eventData.type ==  exports.eventTypes.invoiceCreated){
                console.log('charge succeeded. By subscription' + eventData.data.object.subscription);
                stripe.getPlanNameByCustomerSubscription(stripeAccountId, eventData.data.object.subscription, function(err, planName) {
                    if(err) {
                        console.log('error getting plan by invoice');
                        console.log(err);
                        return callback(err);
                    }
                    console.log('got plan name by invoice: ' + planName);

                    processSubscriptionUpdate(stripeAccountId, planName, callback);
                });
            } else {
                console.log('charge succeeded. By invoice ' + eventData.data.object.invoice);
                stripe.getPlanNameByInvoice(stripeAccountId, eventData.data.object.invoice, function(err, planName) {
                    if(err) {
                        console.log('error getting plan by invoice');
                        console.log(err);
                        return callback(err);
                    }
                    console.log('got plan name by invoice: ' + planName);

                    processSubscriptionUpdate(stripeAccountId, planName, callback);
                });
            }
            break;
        default:
            callback();
            break;
    }
}

function processSubscriptionCancel(stripeAccountId, callback){
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

function processSubscriptionUpdate(stripeAccountId, newStripePlanName, callback){
    userService.findUserByStripeAccountId(stripeAccountId, function(err, user){
        if(err) return callback(err);
        if (!user) return callback(console.log(util.format("Unknown stripe account id: %s", stripeAccountId)));
        var currentPlan = _.find(config.app.tariffs, function(tariff) {
            return tariff.stripePlanName == newStripePlanName;
        });
        if (!currentPlan) return callback(console.log(util.format("Unknown plan name: %s", newStripePlanName)));
        var userKey = user.getInfo(infoTypeEnum.userKey);
        if (user.activePlan !== currentPlan.nameLowercase) {
            proxyService.updateAccountAppPlan(userKey,
                currentPlan.nameLowercase, function(err){
                    if(err) return callback(err);
                    userService.updateUserActivePlan(user, currentPlan.nameLowercase);
                    callback();
            });
        }
    });
}
