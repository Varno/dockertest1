var request = require('request'),
    User = require('../models/user'),
    config = require('config'),
    util = require('util'),
    emailService = require('./emailService'),
    proxyService = require('./proxyService'),
    _ = require('underscore'),
    async = require('async');;

exports.getTotalStats = function(callback){
    /*request.get(config.app.totalStatsUrl, function (err, response, body) {
        if(err) return callback(err);
        callback (null, tryParseStats(body));
    });*/
    return 0;
}

exports.getStats = function(userId, callback){
    User.findById(userId, 'info activePlan', function(err, user){
        if(err)
            return callback(err);
        var userKey = user.getInfo(infoTypeEnum.userKey);
        if (!userKey)
            return callback(new Error("Account is not valid for user: " + user._id));
        var statsUrl = util.format(config.app.statsUrl, userKey),
            activePlan = _.where(config.app.tariffs, { nameLowercase: user.activePlan })[0];
        request.get(statsUrl, function (err, response, body) {
            if(err)
                return callback(err);
            var stats = tryParseStats(body);
            if(!stats)
                stats = getDefaults(userKey);
                proxyService.getAccountAppHitsUsage(userKey, function(err, hits){
                    if(err) {
                        console.log(err);
                        return callback(err, stats);
                    }
                    if (hits.value > activePlan.limits.hits)
                        hits.value = activePlan.limits.hits;
                    if(!stats.limit){
                        stats.limit = { total: activePlan.limits.hits, spent: hits.value };
                    }
                    else{
                        stats.limit.total = activePlan.limits.hits;
                        stats.limit.spent = hits.value;
                    }
                    console.log('activePlan');
                    console.log(stats);
                    console.log(activePlan.name);
                    console.log(user.activePlan);
                    stats.userKey = userKey;
                    return callback(null, stats);
                });
        });
    });
};

exports.percentageReport = function(userKey, percent, metric, callback){
    var q = { $and : [ { "info.type": infoTypeEnum.userKey }, { "info.value" : userKey } ] };
    console.log('calling stats service');
    User.findOne(q, 'email firstName lastName info activePlan', function(err, user){
        if(err || !user)
            return callback({ status: 404 });
        console.log('user found');
        console.log(user);
        var templateName = getLimitUsageTemplateNameByPercent(percent);
        if (templateName) {
            var activePlan = _.where(config.app.tariffs, { nameLowercase: user.activePlan });
                proxyService.getAccountAppHitsUsage(userKey, function(error, currentHitsCount){
                    if (error) return callback({ status: 404 });
                    emailService.send(user.email, templateName,
                        getLimitUsageNotifyParams(user, activePlan, metric), callback);
                });
        }
        else {
            console.log('template not found for percent: ' + percent);
            return callback({ status: 404 });
        }
    });
};

function getLimitUsageTemplateNameByPercent(percent) {
    var templates = config.app.emailTemplates.limitUsageNotifyTemplates,
        result = null;
    _.each(config.app.emailTemplates.limitUsageNotifyTemplates, function (template) {
        if (percent >= template.usagePercent)
            result = template.name;
    });
    return result;
}

function getLimitUsageNotifyParams(user, currentLimit, metric) {
    var currentPlanTemplate = null,
        nextPlanTemplate = null;

    _.each(config.app.emailTemplates.limitUsageNotifyTemplates, function(template) {
        if (nextPlanTemplate == null && currentPlanTemplate != null)
            nextPlanTemplate = template;
        if (currentPlanTemplate == null && template.name == currentLimit.name)
            currentPlanTemplate = template;
    });
    if (nextPlanTemplate == null)
        nextPlanTemplate = _.last(config.app.emailTemplates.limitUsageNotifyTemplates);
    var limitPeriodBy = currentLimit.period == "day" ? "daily" : "monthly";
    return {
        "FIRST_NAME": user.firstName,
        "CURRENT_LIMIT_COUNT": currentPlanTemplate[metric],
        "CURRENT_LIMIT_PERIOD_BY": limitPeriodBy,
        "CURRENT_LIMIT_PERIOD": currentPlanTemplate.period,
        "CURRENT_PLAN_NAME": currentPlanTemplate.name,
        "NEXT_PLAN_NAME": nextPlanTemplate.name,
        "NEXT_LIMIT_COUNT": nextPlanTemplate.limits[metric].limit,
        "METRIC_NAME": metric == "hits" ? "requests" : metric
    };
}

function tryParseStats(statsJson){
    var stats;
    try{
        stats = JSON.parse(statsJson);
        return stats;
    } catch(e){
        consiole.log(e);
        return null;
    }
};

function getDefaults(userKey){
    return { userKey: userKey, limit: { total: 0, spent: 0 } };
};

exports.getStatistics = function(userId, callback){
    User.findById(userId, 'info activePlan', function(err, user){
        if(err) return callback(err);
        var userKey = user.getInfo(infoTypeEnum.userKey);
        if (!userKey)
            return callback(new Error("Account is not valid for user: " + user._id));
        proxyService.getStatistics(userKey, function(err, charts){
            if (err) return callback(err);
            var metrics = _(charts).keys();
            async.map(metrics, function(metric, callback) {
                proxyService.getMetricUsage(userKey, metric, callback);
            }, function(err, usage) {
                if (err) return callback(err);
                var result = {};
                for (var i = 0; i < metrics.length; i++) {
                    var metric = metrics[i];
                    var metricUsage = usage[i];
                    result[metric] = {
                        chart: charts[metric],
                        usage: metricUsage.usage
                    };
                    if (!_.isUndefined(metricUsage.limit))
                        result[metric].limit = metricUsage.limit.limit;
                }
                callback(null, { statistics: result });
            })
        });
    });
}