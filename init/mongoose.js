var util = require('util'),
    mongoose = require('mongoose'),
    config = require('config');

exports.init = function(){
    var connectToMongo = function () {
        var db = config.app.db;
        mongoose.connect(db.getConnectionString(), db.options)
    }

    connectToMongo();

    mongoose.connection.on('error', function (err) {
        console.log(err);
    })

    mongoose.connection.on('disconnected', function () {
        connectToMongo();
    })
}
