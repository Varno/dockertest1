var sitemapService = require('../services/sitemapService');

exports.get = function(req, res){
    res.header('Content-Type', 'application/xml');
    res.sendfile(sitemapService.filePath);
}

exports.rebuild = function(req, res){
    sitemapService.rebuild(function(err) {
        if (err) return res.send(500, err.message);
        res.send(200, 'OK');
    });
}
