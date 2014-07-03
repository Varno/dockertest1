var _ = require('underscore'),
    fs = require('fs'),
    util = require('util'),
    config = require('config'),
    moment = require('moment'),
    User = require('../models/user'),
    TemplateService = require('../services/templateService');

var TemplatePath = 'views/templates/sitemap';
var FilePath = 'data/sitemap.xml';

exports.filePath = FilePath;

exports.rebuildIfMissing = function (callback) {
    fs.exists(FilePath, function (exists) {
        if (!exists)
            exports.rebuild(callback);
    });
}

exports.rebuild = function (callback) {
    User.find({ role: GLOBAL.roleEnum.speaker, alias: { '$ne': null } }, function (err, users) {
        var profiles = _.map(users, function (user) {
            return {
                publicUrl: util.format('%s/%s', config.app.domain, user.alias),
                updatedAt: moment(user.updatedAt).format('YYYY-MM-DD')
            };
        });

        // Render sitemap
        var xml = TemplateService.compile(TemplatePath, { profiles: profiles });

        // Update static file
        fs.writeFile(FilePath, xml, function (err) {
            callback(err, FilePath);
        });
    });
}