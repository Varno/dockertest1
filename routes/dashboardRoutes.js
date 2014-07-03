var dashboardController = require('../controllers/dashboardController'),
    permissionService = require('../services/permissionService'),
    menu = require('../middleware/menu'),
    menuSetup = require('./menu');

module.exports = function (app) {

    var apiPermissions = [permissionService.ajaxCompleteStatusOnly];
    var pagePermissions = [permissionService.completeStatusOnly];

    app.get('/dashboard', permissionService.authorizedOnly(), permissionService.check(pagePermissions),
        menu({ menu: menuSetup.pages, preprocessors: menuSetup.preprocessors }),
        dashboardController.index);

    app.get('/api/user/current', permissionService.ajaxAuthorizedOnly(), permissionService.check(apiPermissions),
        dashboardController.get);
    app.get('/api/user/current/userkey', permissionService.ajaxAuthorizedOnly(),
        permissionService.check(apiPermissions), dashboardController.getUserKey);
    app.post('/api/user/current', permissionService.ajaxAuthorizedOnly(), permissionService.check(apiPermissions),
        dashboardController.update);

    app.get('/api/user/current/pixels', permissionService.ajaxAuthorizedOnly(), permissionService.check(apiPermissions),
        dashboardController.getPixels);
    app.get('/api/user/current/details', permissionService.ajaxAuthorizedOnly(),
        permissionService.check(apiPermissions), dashboardController.getDetails);
    app.get('/api/user/current/statistics', permissionService.ajaxAuthorizedOnly(),
        permissionService.check(apiPermissions), dashboardController.getStatistics);

    app.post('/api/user/current/emailMeAgain', permissionService.ajaxAuthorizedOnly(),
        dashboardController.emailMeAgain);

    app.post('/api/user/current/callMeAgain', permissionService.ajaxAuthorizedOnly(),
        dashboardController.callMeAgain);
}