var statsService = require('../services/statsService'),
    config = require('config'),
    util = require('util');

exports.getStats = function(req, res){
    userId = req.params.userId;
    if(!userId)
        throw new Error("Cannon get stats: userId is invalid");
    statsService.getStats(userId, function(err, stats){
        console.log('stats');
        console.log(stats);
        if(err){
            if(err instanceof Error)
                throw err;
            else
                throw new Error('Error: ' + JSON.stringify(err));
        }
        res.send(stats);
    });
};

exports.percentageReport = function(req, res, next){
    var ip = req.connection.remoteAddress;
    /*if(config.app.allowApiCallsFrom.indexOf(ip) == -1){
        console.log(util.format('Сall from IP %s denied', ip));
        return next();
    }*/
    console.log('call allowed');
    console.log(req.url);
    var userKey = req.query.user_key,
        percent = req.query.percent,
        metric = req.query.metric;
    console.log(req.body);
    console.log('userKey: ' + userKey + ', percent: ' + percent + ', metric: ' + metric);
    if(!userKey)
        return next();
    statsService.percentageReport(userKey, percent, metric, function(err, status){
        if(err){
            if(err.status == 404){
                console.log('User with key ' + userKey + ' does not exist in database');
                return next();
            }
            console.log('some error happened: see details');
            console.log(err);
            return res.send(500, err);
        }
        console.log('succeeded');
        res.send(status);
    });
}

exports.getTotalStats = function(req, res){
    statsService.getTotalStats(function(err, stats){
        if(err){
            console.log('some error happened: see details');
            console.log(err);
            return res.send(500, err);
        }
        res.send(stats);
    });
};
