var _ = require('underscore'),
    config = require('config'),
    ironMQ = require('iron_mq');

var getIronQueue = function (queueName) {
    return new ironMQ.Client({
        token: config.app.ironMQ.token,
        project_id: config.app.ironMQ.projectId,
        queue_name: queueName
    });
}

module.exports.post = function(queueName, content, options, callback){
    var queue = getIronQueue(queueName);
    var message = {
        body: JSON.stringify(content)
    };

    if(options.delay) message.delay = options.delay;
    queue.post(message, callback);
}
