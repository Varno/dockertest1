var config = require('config'),
    util = require('util');

config.app.db.getConnectionString = function() {
    var db = config.app.db;
    var userPassword = db.user ?  util.format('%s:%s@', db.user, db.password) : "";
    var dbPath = util.format('mongodb://%s%s:%d/%s', userPassword, db.server, db.port, db.database);
    return dbPath;
}