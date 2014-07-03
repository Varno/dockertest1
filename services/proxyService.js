var request = require("request"),
    querystring = require("querystring"),
    util = require("util"),
    moment = require("moment"),
    async = require("async"),
    config = require('config'),
    _ = require('underscore'),
    User = require('../models/user');

exports.createAccount = function (userKey, callback) {
    exports.updateAccountAppPlan(userKey, config.app.basicPlanName.toLowerCase(), callback);
}

exports.suspendAccount = function (userKey, callback) {
    var serviceBaseUrl = config.app.proxyServiceBaseUrl,
        accountUri = util.format('%s/%s/limits/', serviceBaseUrl, userKey),
        params = {
            method: "DELETE",
            url: accountUri
        };
    request(params, function (error, response, body) {
        callback(error);
    });
}

exports.resumeAccount = function (userKey, planName, callback) {
    exports.updateAccountAppPlan(userKey, planName, callback);
}

exports.updateAccountAppPlan = function (userKey, planName, callback) {
    var serviceBaseUrl = config.app.proxyServiceBaseUrl,
        accountUri = util.format('%s/%s/limits/', serviceBaseUrl, userKey),
        activePlan = _.where(config.app.tariffs, { nameLowercase: planName })[0],
        params = {
            method: "POST",
            url: accountUri,
            json: {}
        };
    for (var measure in activePlan.limits)
        params.json[measure] = { limit: activePlan.limits[measure].limit, period: activePlan.limits[measure].period };
    params.json.events = { hits: {}, bandwidth: {}, storage: {} };

    _.each(config.app.emailTemplates.limitUsageNotifyTemplates, function (template) {
        params.json.events.hits[Math.floor(activePlan.limits.hits.limit * template.usagePercent / 100)] =
            encodeURIComponent(util.format("%s/percentageReport?percent=%s&user_key=%s&metric=%s",
                config.app.domain, template.usagePercent, userKey, "hits"));
        params.json.events.bandwidth[Math.floor(activePlan.limits.bandwidth.limit * template.usagePercent / 100)] =
            encodeURIComponent(util.format("%s/percentageReport?percent=%s&user_key=%s&metric=%s",
                config.app.domain, template.usagePercent, userKey, "bandwidth"));
        params.json.events.storage[Math.floor(activePlan.limits.storage.limit * template.usagePercent / 100)] =
            encodeURIComponent(util.format("%s/percentageReport?percent=%s&user_key=%s&metric=%s",
                config.app.domain, template.usagePercent, userKey, "storage"));
    });

    console.log('updating plan');
    console.log(params);
    request(params, function (error, response, body) {
        console.log('plan updated');
        console.log(body);
        callback(error);
    });
}

exports.getAccountAppHitsUsage = function (userKey, callback) {
    var serviceBaseUrl = config.app.proxyServiceBaseUrl;

    var actionUri = util.format('%s/%s/usage/statistics',
        serviceBaseUrl, userKey);

    request.get(actionUri, function (error, response, body) {
        if (error) {
            return callback(error);
        }
        var reportData = JSON.parse(body);
        if (reportData.hasOwnProperty("error")) {
            callback({ error: reportData.error });
            return;
        }

        var count = 0;
        for (idx = 0; idx < reportData.statisticsGet.length; idx++) {
            count += reportData.statisticsGet[idx].usage.hits;
        }
        callback(null, {
            value: count,
            //not sure, why it's needed
            period: reportData.statisticsGet[0] ? reportData.statisticsGet[0].period : "month"
        });
    });
}

var MetricTypes = { point: "point", aggregative: "aggregative" };
function getUserMetricTypes(userKey, callback) {
    var serviceBaseUrl = config.app.proxyServiceBaseUrl;
    var actionUri = util.format('%s/%s/limits', serviceBaseUrl, userKey);
    request.get(actionUri, function (error, response, body) {
        if (error) return callback(error);
        var reportData = JSON.parse(body);
        if (reportData.hasOwnProperty("error")) return callback({ error: reportData.error });
        var result = _(_(_(_(reportData.limitsGet).pairs()).filter(function(e) { return e[0] != "events"; }))
            .reduce(function(acc, p) {
                acc[p[0]] = _.isUndefined(p[1].period) ? MetricTypes.aggregative : MetricTypes.point;
                return acc;
            }, {})).value();
        callback(null, result);
    });
}

exports.getMetricUsage = function (userKey, metric, callback) {
    var serviceBaseUrl = config.app.proxyServiceBaseUrl;
    var actionUri = util.format('%s/%s/usage/%s', serviceBaseUrl, userKey, metric);
    request.get(actionUri, function (error, response, body) {
        if (error) return callback(error);
        var reportData = JSON.parse(body);
        if (reportData.hasOwnProperty("error")) return callback({ error: reportData.error });
        callback(null, reportData.usage);
    });
}

exports.getStatistics = function (userKey, callback) {
    var serviceBaseUrl = config.app.proxyServiceBaseUrl;
    var actionUri = util.format('%s/%s/usage/statistics', serviceBaseUrl, userKey);
    request.get(actionUri, function (error, response, body) {
        if (error) return callback(error);
        var reportData = JSON.parse(body);
        if (reportData.hasOwnProperty("error")) return callback({ error: reportData.error });

        getUserMetricTypes(userKey, function (error, metricTypes) {
            if (error) return callback(error);
            var counts = JSON.stringify(_(_(_(_.range(-moment().subtract('months', 1).daysInMonth(), 1))
                .map(function (s) { return moment().add("days", s).format("YYYY-MM-DD"); }))
                .reduce(function (a, d) {
                    a[d] = 0;
                    return a;
                }, {})).value());
            var result = _(_(metricTypes).keys()).reduce(function(a, k) {
                a[k] = JSON.parse(counts);
                return a;
            }, {});
            _(_(_(reportData.statistics)
                .where({ period: "day" }))
                .sortBy(function (e) { return e.date }).reverse())
                .each(function (e) {
                    for (var metric in e.usage) {
                        if (!_.isUndefined(result[metric][e.date])) {
                            result[metric][e.date] = e.usage[metric];
                        }
                    }
                });
            // Aggregative statistics
            _(_(_(_(metricTypes).pairs()).filter(function(e) { return e[1] == MetricTypes.aggregative }))
                .map(function(e) { return e[0] })).each(function(metric) {
                    _(_(_(_(result[metric]).keys()).sortBy(function(k) { return k }))).each(function (k) {
                        var last = _(_(_(_(result[metric]).pairs()).filter(function(p) { return p[0] < k }))
                            .sortBy(function(p) { return p[0] })).last();
                        if (!_.isUndefined(last))
                            result[metric][k] += last[1];
                    });
                    var currentUsage = _(_(_(reportData.statistics)
                        .filter(function(e) { return _.isUndefined(e.period) }))
                        .map(function (e) { return e.usage[metric] })).first();
                    if (!_.isUndefined(currentUsage)) {
                        var lastDate = _(_(_(_(result[metric]).keys()).sortBy(function(k) { return k }))).last();
                        var shift = currentUsage - result[metric][lastDate];
                        if (shift > 0)
                            for (var date in result[metric])
                                result[metric][date] += shift;
                    }
                });
            callback(null, result);
        });
    });
}

function isNullOrWhiteSpace(str) {
    return str === null || str.match(/^ *$/) !== null;
}
