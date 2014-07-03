var resetPasswordRoutes = require('./resetPasswordRoutes'),
    activationRoutes = require('./activationRoutes'),
    authRoutes = require('./authRoutes'),
    dashboardRoutes = require('./dashboardRoutes'),
    apiRoutes = require('./apiRoutes'),
    tariffsRoutes = require('./tariffsRoutes'),
    imageMngtRoutes = require('./imageMngtRoutes'),
    indexController = require('../controllers/indexController');

exports.init = function (app) {
    app.get('/', indexController.home);

    apiRoutes(app);

    activationRoutes(app);
    resetPasswordRoutes(app);

    authRoutes(app);
    dashboardRoutes(app);
    tariffsRoutes(app);
    imageMngtRoutes(app);
}