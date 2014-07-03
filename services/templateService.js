var Bliss = require('bliss');

exports.compile = function (templatePath, context) {
    var bliss = new Bliss({
        ext: ".html",
        cacheEnabled: true,
        context: {}
    });
    return bliss.compileFile(templatePath)(context);
}