var config = require('config'),
    request = require('request'),
    fs = require('fs'),
    _ = require('underscore'),
    util = require('util'),
    querystring = require('querystring'),
    htmlEncode = require('htmlencode').htmlEncode;

exports.index = function(req, res){
    var apiUrl = util.format("%s/docs", config.app.proxyServiceBaseUrl);
    res.render('dashboard/resizer-api-docs', {
        version: config.app.version,
        currentUser: req.user || null,
        userKey: req.user ? req.user.getInfo(infoTypeEnum.userKey) : '',
        apiUrl: apiUrl,
        title: 'External libs usage with resizer',
        menu : req.menu
    });
}

exports.externalLibsDescription = function(req, res){
    var model = {
        sampleImageBaseUrl: util.format("/resize?source=%s/images/samples",
            config.app.domain)
    };
    var htmlExample1 = util.format("<img src='%s/sample3.jpg&?constrainWidth=900&constrainHeight=700' \n" +
        "srcset='%s/sample3.jpg&?constrainWidth=900&constrainHeight=700 1200w," +
        "%s/sample2.jpg&constrainWidth=720&constrainHeight=600 800w," +
        "%s/sample1.jpg&constrainWidth=100&constrainHeight=200 400w\n" +
        "sizes='100vw, (min-width: 40px) 80vw' \n" +
        "alt='Responsive Images'/>",
                model.sampleImageBaseUrl, model.sampleImageBaseUrl,
                model.sampleImageBaseUrl, model.sampleImageBaseUrl);
    model.htmlExample1 = htmlEncode(htmlExample1);

    var htmlExample2 = util.format("<img \n" +
        " data-src-base='%s'" +
        " data-src='<480:/sample1.jpg&constrainWidth=100&constrainHeight=200, " +
        "               <960:/sample2.jpg&constrainWidth=720&constrainHeight=600, " +
        "               >960:/sample3.jpg&?constrainWidth=900&constrainHeight=700'" +
        " alt='Responsive Images'/>",
        model.sampleImageBaseUrl);

    model.htmlExample2 = htmlEncode(htmlExample2);
    model.menu = req.menu;
    if(req.user){
        model.currentUser = req.user;
    }

    res.render('dashboard/externalLibsDescription', model);
}

exports.imageResizerProxy = function(req, res){
    if (req.query["source"] == undefined
        || !isAllowedResizingResource(req.query["source"]))
        res.send(400);
    var resizeApiUrl = util.format("%s/api/%s?%s",
        config.app.resizerDomain,
        config.app.resizerApiVersion,
        querystring.stringify(req.query));
    request.get(resizeApiUrl).pipe(res);
}

exports.imageResizerSettings = function(req, res){
    var resizeApiUrl = util.format("%s/api/%s/settings",
        config.app.resizerDomain,
        config.app.resizerApiVersion);
    request.get(resizeApiUrl).pipe(res);
}

var allowedUrls = [];
_.each(fs.readdirSync("./public/images/samples"), function(fileName) {
    allowedUrls.push(util.format("%s/images/samples/%s",
        config.app.domain, fileName));
});

function isAllowedResizingResource(imgResourceUrl) {
    var lowerCaseUrl = imgResourceUrl.toLowerCase();
    return _.any(allowedUrls, function(url){
        return url.toLowerCase() == lowerCaseUrl;
    });
}