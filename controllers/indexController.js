
/**
 * Created by ASUS on 08.04.2014.
 */
exports.home = function(req, res){
    if(req.isAuthenticated())
        return res.redirect('/dashboard');
    res.sendfile('public/views/index.html');
};