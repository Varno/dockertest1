var _ = require('underscore'),
    config = require('config');

exports.init = function(app){
    var airbrake = require('airbrake').createClient(config.app.airbrake.apiKey);
    app.use(airbrake.expressHandler());

    var privateFields = ['password', 'salt', 'token', 'requestToken'];
    airbrake.on('vars', function(type, vars) {
        if(type == "params"){
            _.each(privateFields, function(field){
                delete vars[field];
            })
        }
    });
}