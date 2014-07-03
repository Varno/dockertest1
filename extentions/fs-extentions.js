var fs = require('fs'),
    path = require('path'),
    mkdirp = require('mkdirp');

fs.mkdirParent = function(dirPath,  callback) {
    fs.exists(dirPath, function (exists) {
        !exists ? mkdirp(dirPath, callback) : callback();
    });
};