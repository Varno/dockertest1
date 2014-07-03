var express = require('express'),
    http = require('http'),
    path = require('path'),
    config = require('config'),
    passport = require('passport'),
    flash = require('connect-flash'),
    Bliss = require('bliss'),
    MongoStore = require('connect-mongo')(express),
    socket = require('socket.io'),
    routes = require('./routes'),
    initializer = require('./init');

require('./extentions');
require('./errors/index');

initializer.mongoose.init();

var app = express();

var bliss = new Bliss({
    ext: ".html",
    cacheEnabled: false,
    context: {}
});

app.configure(function(){
    app.engine('html', function (path, options, fn) {
        fn(null, bliss.render(path, options));
    });
    app.set('view engine', 'html');
    app.set('views', path.join(__dirname, 'views'));

    app.set('port', process.env.PORT || 3000);
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.static(path.join(__dirname, '/public')));
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.methodOverride());
    app.use(express.cookieParser(config.app.cookieSecret));
    app.use(express.session({
        secret: config.app.cookieSecret,
        store: new MongoStore({
            url: config.app.db.getConnectionString()
        })
    }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(passport.authenticate('remember-me'));

    app.use(app.router);
})

// Development only
app.configure('development', function () {
    app.use(function (err, req, res, next) {
        // Show full error datails with express.errorHandler
        if (req.xhr || err.statusCode != 404)
            return next(err);

        res.status(404);
        res.render('errors/404', { message: err.message });
    });

    app.use(express.errorHandler());
})

// Production only
app.configure('production', function () {
    // Report airbrake first
    initializer.airbrake.init(app);

    // Render custom response
    app.use(function (err, req, res, next) {
        var statusCode = err.statusCode ? err.statusCode : 500;
        res.status(statusCode);

        if (req.xhr) {
            // Restrict error object with status code and message only
            res.send({ statusCode: statusCode, message: err.message });
        } else {
            // Render page without details
            res.render('errors/' + (err.statusCode == 404 ? '404' : '500'));
        }
    });
})

initializer.passport.init();
initializer.passreset.init();
initializer.enums.init();
routes.init(app);

var server = http.createServer(app);
server.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});