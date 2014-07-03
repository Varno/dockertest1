var config = require('config'),
    util = require("util"),
    moment = require("moment"),
    async = require("async"),
    _ = require("underscore"),
    stripe = require('stripe')(config.app.stripe.secretKey);

exports.createCustomer = function (email, callback) {
    stripe.customers.create({ email: email }, function (err, customer) {
            if (err) return callback(err);
            callback(null, customer.id);
        }
    );
}

exports.getPlanNameByCustomerSubscription = function (customerId, subscriptionId, callback) {
    stripe.customers.retrieveSubscription(customerId, subscriptionId, function(err, subscription) {
        if (err) return callback(err);
        if (!subscription) return callback(new Error("Subscription not found"));
        return callback(null, subscription.plan.name);
    });
}

exports.getPlanNameByInvoice = function (customerId, invoiceId, callback) {
    stripe.invoices.retrieve(invoiceId, function(err, invoice) {
        if (err) return callback(err);
        var subscription = _.find(invoice.lines.data, function(item){
            return item.type == "subscription";
        });
        if (!subscription) return callback(new Error("Subscription not found"));
        return callback(null, subscription.plan.name);
    });
}

exports.updateSubscription = function (stripeAccountId, newStripePlanName, token, callback) {
    var basicPlan = _.findWhere(config.app.tariffs, { nameLowercase: config.app.basicPlanName }),
        newPlan = _.findWhere(config.app.tariffs, { stripePlanName : newStripePlanName });

    stripe.customers.listSubscriptions(stripeAccountId, function (err, subscriptionsResponse) {
        var currentSubscription = _.find(subscriptionsResponse.data, function (subscription) {
            return subscription.status == "active";
        });

        if (newPlan.name == basicPlan.name && !!currentSubscription) {
            return cancelSubscription(stripeAccountId, currentSubscription.id, true, callback);
        }

        if (newPlan.name != basicPlan.name && !currentSubscription) {
            return createSubscription(stripeAccountId, newStripePlanName, token, callback);
        }

        if (currentSubscription.plan.id !== newStripePlanName) {
            var currentPlan = _.findWhere(config.app.tariffs, { stripePlanName: currentSubscription.plan.id });
            updateSubscription(stripeAccountId, currentSubscription.id, newStripePlanName, token,
                currentPlan.price < newPlan.price, // Upgrade or downgrade
                callback);
        }
        else {
            callback();
        }
    });
}

function cancelSubscription(stripeAccountId, subscriptionId, at_period_end, callback) {
    stripe.customers.cancelSubscription(stripeAccountId, subscriptionId, { at_period_end: at_period_end }, callback);
}

function createSubscription(stripeAccountId, newPlanName, token, callback) {
    stripe.customers.createSubscription(stripeAccountId, { plan: newPlanName, card: token },
        function (err, subscription) {
            if (err) return callback(err);
            callback(null, subscription);
        }
    );
}

function updateSubscription(stripeAccountId, subscriptionId, newPlanName, token, needProrate, callback) {
    stripe.customers.updateSubscription(stripeAccountId, subscriptionId,
        { plan: newPlanName, card: token, prorate: needProrate },
        function (err, subscription) {
            if (err) return callback(err);
            callback(null, subscription);
        }
    );
}
