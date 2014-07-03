var path = require('path');

exports.index = function(req, res){
    res.render(path.join('templates', req.params.id, req.param(0)));
}