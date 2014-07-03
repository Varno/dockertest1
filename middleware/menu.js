/**
 * Created by ASUS on 21.05.2014.
 */
exports = module.exports = function(options){
    if(!options)
        return noop;
    if(!options.menu)
        return noop;
    var menu = options.menu,
        preprocessors = options.preprocessors || [];
    return function(req, res, next){
        var url = req.url,
            menuCopy = [];
        if(preprocessors) {
            for (var item in menu) {
                var menuItem = JSON.parse(JSON.stringify(menu[item]));
                for(var i=0; i< preprocessors.length; i++){
                    if(typeof preprocessors[i] === 'function') {
                        menuItem = preprocessors[i](url, menuItem);
                        if(i === preprocessors.length -1)
                            menuCopy.push(menuItem);
                    }
                }
            }
        }
        req.menu = menuCopy;
        next();
    };
};

function noop(req, res, next){
    if(next)
        next();
};