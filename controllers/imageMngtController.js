var config = require('config'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    moment = require('moment'),
    mime = require('mime'),
    util = require('util');

exports.index = function (req, res) {
    var model = {
        currentUser: req.user || null,
        userKey: req.user ? req.user.getInfo(infoTypeEnum.userKey) : '',
        title: 'Image Management',
        menu: req.menu
    }
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.render('imageManagement/index', model);
};

exports.resize = function (req, res) {
    res.send(501);
};