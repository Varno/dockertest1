var _ = require('underscore'),
    config = require('config'),
    queueService = require('./queueService');

exports.send = function (to, templateName, context, callback) {
    var vars = [];
    _.each(context, function (value, key) {
        vars.push({name: key, content: value});
    })

    queueService.post(
        config.app.ironMQ.queues.emailQueue.name,
        {
            template_name: templateName,
            template_content: [],
            message: {
                to: [
                    {
                        email: to,
                        name: to
                    }
                ],
                merge_vars: [
                    {
                        rcpt: to,
                        vars: vars
                    }
                ]
            }
        },
        {},
        function (err, body) {
            callback(err, body);
        });
}
