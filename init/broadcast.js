/**
 * Created by ASUS on 10.04.2014.
 */
var statsService = require('../services/statsService'),
    config = require('config');

exports.init = function (io) {

    io.sockets.on('connection', function (socket) {
        setInterval(function() {
            statsService.getTotalStats(function (err, stats) {
                if (!stats)
                    return;
                if(err)
                    return console.log(err);
                socket.emit('totalpixels', stats);
            });
        }, config.app.statsRefreshIntervalMs);
    });
};