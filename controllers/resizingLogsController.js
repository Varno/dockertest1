var config = require('config'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    moment = require('moment'),
    mime = require('mime'),
    util = require('util'),
    FILE_ENCODING = 'utf-8',
    EOL = '\n';

exports.export = function(req, res){
    var dateFrom = moment(req.params.dateFrom, "YYYY-MM-DD").utc().toDate(),
        dateTo = moment(req.params.dateTo, "YYYY-MM-DD").utc().toDate(),
        currentUser = req.user,
        userKey = currentUser.getInfo(infoTypeEnum.userKey),
        userFolderPath = path.normalize(util.format('../UserResizerLogs/%s', userKey));

    getOrCreateResultsFolderPath(userFolderPath, function(resultsFolderPath){
        var resultFilePath = path.join(resultsFolderPath,
            util.format("%s_%s.txt", req.params.dateFrom, req.params.dateTo));
        res.setHeader('Content-disposition', 'attachment; filename=' + path.basename(resultFilePath));
        fs.exists(resultFilePath, function(exists){
            if (exists) return fs.createReadStream(resultFilePath).pipe(res);

            getTargetFiles(userFolderPath, dateFrom, dateTo, function(err, srcFilePaths){
                if (err || !_(srcFilePaths).any()) return res.send(404);

                concatFiles(srcFilePaths, resultFilePath);
                fs.createReadStream(resultFilePath).pipe(res);
            });
        });
    });
}

exports.import = function(req, res){
    res.send(501); // Not implemented yet
}

function concatFiles(srcFilePaths, destFilePath) {
    var out = srcFilePaths.map(function(filePath){
        return fs.readFileSync(filePath, FILE_ENCODING);
    });
    fs.writeFileSync(destFilePath, out.join(EOL), FILE_ENCODING);
}

function getTargetFiles(srcFolderPath, dateFrom, dateTo, callback) {
    fs.readdir(srcFolderPath, function(err, files){
        if (err) return callback(err);
        var srcFilePaths = [];
        _(files).each(function(fileName){
            var filePath = path.join(srcFolderPath, fileName),
                stats = fs.statSync(filePath);
            if (stats.isFile() && stats.ctime >= dateFrom && stats.ctime < dateTo) {
                srcFilePaths.push(filePath);
            }
        });
        return callback(null, srcFilePaths);

    });
}

function getOrCreateResultsFolderPath(userFolderPath, callback) {
    var resultFolderPath = path.join(userFolderPath, "queryResults");
    fs.exists(resultFolderPath, function(exists){
        if (!exists) {
            fs.mkdir(resultFolderPath, function(){
                callback(resultFolderPath);
            });
            return;
        }
        callback(resultFolderPath);
    });
}